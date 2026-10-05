// Candidate packets: references only (ayah keys, tafsir source + ayah), never text. Every candidate must
// pass the Source Guard; a failing one is dropped and logged, never repaired.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { verifyAyat, verifyTranslation, type SourceBundle } from "@/lib/guard";
import type { Usage } from "@/lib/vision/types";
import { SCORE_THRESHOLD, TOP_FINAL, TRANSLATION_ID } from "./config";
import type { Embedder } from "./embed";
import type { RagIndex } from "./index-store";
import type { Reranker } from "./rerank";
import { retrieve, type Bm25, type FoundBy, type Query } from "./retrieve";
import { TAFSIR_ATTRIBUTION, type TafsirSourceId, type TafsirTexts } from "./tafsir";

export type Candidate = { key: string; score: number | null; found_by: FoundBy; evidence: { tafsir: { source: TafsirSourceId; ref: string }[] } };
export type Packet = {
  query: string;
  concept: string | null;
  candidates: Candidate[];
  status: "ok" | "no-strong-match";
  built: { indexManifest: string; reranker: string | null; reranked: boolean; channelsMissing: string[]; dropped: { key: string; reason: string }[]; at: string };
};

const EVIDENCE_SOURCES: TafsirSourceId[] = ["al-Muyassar", "al-Mukhtasar (Arabic)", "al-Mukhtasar (English)"];
const refOf = (key: string) => {
  const [surah, ayah] = key.split(":").map(Number) as [number, number];
  return { surah, ayah };
};
const translationChoice = [{ lang: "en" as const, source: TRANSLATION_ID }];

export function checkCandidate(key: string, bundle: SourceBundle): string | null {
  if (!verifyAyat([refOf(key)], bundle)) return "verse-text-mismatch";
  if (!verifyTranslation([key], translationChoice, "en", bundle)) return "translation-mismatch";
  return null;
}

/** Display-time evidence (Phase 2 reviewer page). Texts come from the original files; null if any check fails. */
export function renderEvidence(key: string, bundle: SourceBundle, tafsir: TafsirTexts) {
  const ayat = verifyAyat([refOf(key)], bundle);
  const tr = verifyTranslation([key], translationChoice, "en", bundle);
  if (!ayat || !tr) return null;
  const t = tafsir.get(key) ?? {};
  return {
    arabic: ayat[0]!.text,
    translation: tr.texts.get(key)!,
    notes: tr.notes.get(key) ?? null,
    tafsir: EVIDENCE_SOURCES.filter((s) => t[s]).map((s) => ({ source: s, text: t[s]!, attribution: TAFSIR_ATTRIBUTION })),
  };
}

export async function proposeOne(
  q: Query,
  deps: { index: RagIndex; bm25: Bm25; embedder: Embedder | null; reranker: Reranker | null; bundle: SourceBundle; tafsir: TafsirTexts; threshold?: number; now?: Date },
): Promise<{ packet: Packet; usage?: Usage }> {
  const threshold = deps.threshold ?? SCORE_THRESHOLD;
  const r = await retrieve(q, deps.index, { bm25: deps.bm25, embedder: deps.embedder });

  const dropped: { key: string; reason: string }[] = [];
  const passing = r.keys.filter((key) => {
    const reason = checkCandidate(key, deps.bundle);
    if (reason) dropped.push({ key, reason });
    return !reason;
  });

  let ranked: { key: string; score: number | null }[] = passing.slice(0, TOP_FINAL).map((key) => ({ key, score: null }));
  let reranked = false;
  let usage: Usage | undefined;
  if (deps.reranker && passing.length > 0) {
    try {
      const byKey = new Map(deps.index.passages.map((p) => [p.key, p]));
      const res = await deps.reranker.rank(q, passing.map((k) => byKey.get(k)!));
      ranked = res.items.filter((i) => i.score >= threshold);
      usage = res.usage;
      reranked = true;
    } catch (e) {
      console.warn(`Re-ranker failed (${e instanceof Error ? e.message : e}); keeping the fused order, not re-ranked`);
    }
  }

  const candidates: Candidate[] = ranked.map(({ key, score }) => {
    const t = deps.tafsir.get(key) ?? {};
    return { key, score, found_by: r.foundBy[key] ?? {}, evidence: { tafsir: EVIDENCE_SOURCES.filter((s) => t[s]).map((source) => ({ source, ref: key })) } };
  });

  return {
    usage,
    packet: {
      query: [q.text, ...q.arTerms].join("; "),
      concept: q.concept,
      candidates,
      status: candidates.length > 0 ? "ok" : "no-strong-match",
      built: {
        indexManifest: deps.index.manifestSha256,
        reranker: deps.reranker?.model ?? null,
        reranked,
        channelsMissing: r.channelsMissing,
        dropped,
        at: (deps.now ?? new Date()).toISOString(),
      },
    },
  };
}

export function packetMarkdown(p: Packet): string {
  const lines = [
    `# ${p.concept ?? p.query}`,
    "",
    "مقترحات آلية — لم تُراجَع بعد · Automatic proposals, not reviewed. References only; read each ayah on quran.com.",
    "",
    `Query: ${p.query}  `,
    `Status: **${p.status}** · re-ranked: ${p.built.reranked ? `yes (${p.built.reranker})` : "no"} · missing channels: ${p.built.channelsMissing.join(", ") || "none"}`,
    "",
    "| # | Ayah | Score | Found by (rank) | Tafsir evidence | Link |",
    "|---|---|---|---|---|---|",
    ...p.candidates.map((c, i) => {
      const [s, a] = c.key.split(":");
      const by = Object.entries(c.found_by).map(([k, v]) => `${k} ${v}`).join(", ");
      return `| ${i + 1} | ${c.key} | ${c.score?.toFixed(2) ?? "—"} | ${by || "—"} | ${c.evidence.tafsir.map((t) => t.source).join(", ") || "—"} | https://quran.com/${s}/${a} |`;
    }),
  ];
  if (p.built.dropped.length) lines.push("", `Dropped by the Source Guard: ${p.built.dropped.map((d) => `${d.key} (${d.reason})`).join(", ")}`);
  return lines.join("\n") + "\n";
}

const slug = (p: Packet) =>
  (p.concept ?? p.query).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "query";

export function writePacket(dir: string, p: Packet, date: string): { json: string; md: string } {
  mkdirSync(dir, { recursive: true });
  const base = join(dir, `${date}-${slug(p)}`);
  writeFileSync(`${base}.json`, JSON.stringify(p, null, 2) + "\n");
  writeFileSync(`${base}.md`, packetMarkdown(p));
  return { json: `${base}.json`, md: `${base}.md` };
}
