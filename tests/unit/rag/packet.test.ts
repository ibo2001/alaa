import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { SourceBundle } from "@/lib/guard";
import { loadSources } from "@/lib/sources/load";
import type { RagIndex } from "@/rag/index-store";
import { checkCandidate, packetMarkdown, proposeOne, renderEvidence, writePacket } from "@/rag/packet";
import { buildBm25, queryForText } from "@/rag/retrieve";
import { StubReranker } from "@/rag/rerank";
import type { TafsirTexts } from "@/rag/tafsir";

const real = loadSources();
const keys = ["16:53", "21:30", "55:13"];
const index: RagIndex = {
  manifest: { builtAt: "", sources: { quran: "", translation: "", tafsir: "" }, embedding: null, passages: 3 },
  manifestSha256: "m".repeat(64),
  passages: keys.map((key, i) => ({ key, ar: "", en: ["blessing favour", "water life", "favours deny"][i]!, enMukhtasar: "", arMuyassar: "", roots: [] })),
  lexicon: {},
  embeddings: null,
};
const tafsir: TafsirTexts = new Map([["21:30", { "al-Muyassar": "placeholder", "al-Mukhtasar (English)": "placeholder en" }]]);
const deps = (scores: Record<string, number> | null, bundle: SourceBundle = real) => ({
  index,
  bm25: buildBm25(index),
  embedder: null,
  reranker: scores ? new StubReranker(scores) : null,
  bundle,
  tafsir,
  threshold: 0.5,
  now: new Date("2026-10-06T07:00:00Z"),
});

function withQuran(key: string): SourceBundle {
  const quran = new Map(real.quran);
  quran.set(key, quran.get(key)! + " ");
  return { ...real, quran };
}

describe("checkCandidate and renderEvidence (fail closed)", () => {
  it("passes real files and renders the original texts, not normalised copies", () => {
    expect(checkCandidate("21:30", real)).toBeNull();
    const ev = renderEvidence("21:30", real, tafsir)!;
    expect(ev.arabic).toBe(real.quran.get("21:30"));
    expect(ev.translation).toBe(real.translations["en.rwwad"]!.texts!.get("21:30"));
    expect(ev.tafsir.map((t) => t.source)).toEqual(["al-Muyassar", "al-Mukhtasar (English)"]);
    expect(ev.tafsir[0]!.attribution).toMatch(/Tafsir Center/);
  });
  it("blocks an altered Tanzil ayah", () => {
    expect(checkCandidate("21:30", withQuran("21:30"))).toBe("verse-text-mismatch");
    expect(renderEvidence("21:30", withQuran("21:30"), tafsir)).toBeNull();
  });
  it("blocks an altered translation or footnote", () => {
    const tr = real.translations["en.rwwad"]!;
    const texts = new Map(tr.texts!);
    texts.set("21:30", texts.get("21:30") + " ");
    const altered = { ...real, translations: { ...real.translations, "en.rwwad": { ...tr, texts } } };
    expect(checkCandidate("21:30", altered)).toBe("translation-mismatch");
    const notes = new Map(tr.notes);
    notes.set("55:13", (notes.get("55:13") ?? "") + " ");
    const alteredNote = { ...real, translations: { ...real.translations, "en.rwwad": { ...tr, notes } } };
    expect(checkCandidate("55:13", alteredNote)).toBe("translation-mismatch");
  });
});

describe("proposeOne", () => {
  it("keeps re-ranked candidates above the threshold, with references only", async () => {
    const { packet } = await proposeOne(queryForText("water favour"), deps({ "21:30": 0.9, "16:53": 0.6, "55:13": 0.2 }));
    expect(packet.status).toBe("ok");
    expect(packet.candidates.map((c) => c.key)).toEqual(["21:30", "16:53"]);
    expect(packet.candidates[0]!.evidence.tafsir).toEqual([
      { source: "al-Muyassar", ref: "21:30" },
      { source: "al-Mukhtasar (English)", ref: "21:30" },
    ]);
    expect(packet.built).toMatchObject({ reranked: true, reranker: "stub", channelsMissing: ["meaning"], indexManifest: "m".repeat(64) });
    const json = JSON.stringify(packet);
    expect(json).not.toContain(real.quran.get("21:30")!); // no verse text
    expect(json).not.toContain("placeholder"); // no tafsir text
  });

  it("reports no-strong-match instead of padding", async () => {
    const { packet } = await proposeOne(queryForText("water favour"), deps({ "21:30": 0.1 }));
    expect(packet.status).toBe("no-strong-match");
    expect(packet.candidates).toEqual([]);
  });

  it("reports no-strong-match when nothing is retrieved at all", async () => {
    const { packet } = await proposeOne(queryForText("zzzz"), deps({}));
    expect(packet.status).toBe("no-strong-match");
    expect(packet.candidates).toEqual([]);
  });

  it("keeps the fused order, unscored, when the re-ranker fails", async () => {
    const failing = { model: "x", rank: async () => { throw new Error("down"); } };
    const { packet } = await proposeOne(queryForText("water favour"), { ...deps(null), reranker: failing });
    expect(packet.built.reranked).toBe(false);
    expect(packet.status).toBe("ok");
    expect(packet.candidates.every((c) => c.score === null)).toBe(true);
  });

  it("drops and logs a candidate that fails the Guard", async () => {
    const { packet } = await proposeOne(queryForText("water favour"), deps({ "21:30": 0.9, "16:53": 0.8 }, withQuran("21:30")));
    expect(packet.candidates.map((c) => c.key)).toEqual(["16:53"]);
    expect(packet.built.dropped).toEqual([{ key: "21:30", reason: "verse-text-mismatch" }]);
  });
});

describe("writing", () => {
  it("writes JSON and a references-only Markdown summary", async () => {
    const { packet } = await proposeOne(queryForText("water favour"), deps({ "21:30": 0.9 }));
    const dir = mkdtempSync(join(tmpdir(), "alaa-pk-"));
    const paths = writePacket(dir, packet, "2026-10-06");
    expect(paths.json).toMatch(/2026-10-06-water-favour\.json$/);
    expect(JSON.parse(readFileSync(paths.json, "utf8"))).toEqual(packet);
    const md = packetMarkdown(packet);
    expect(md).toContain("https://quran.com/21/30");
    expect(md).toContain("مقترحات آلية — لم تُراجَع بعد");
    expect(md).not.toContain(real.quran.get("21:30")!);
  });
});
