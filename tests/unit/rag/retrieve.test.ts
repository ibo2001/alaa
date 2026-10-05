import { describe, expect, it } from "vitest";
import { StubEmbedder, passageText } from "@/rag/embed";
import type { RagIndex } from "@/rag/index-store";
import { buildLexicon, type Passage } from "@/rag/passages";
import { Bm25, buildBm25, fuse, keywordChannel, queryForConcept, queryForText, queryRoots, retrieve, rootChannel } from "@/rag/retrieve";

const P = (key: string, en: string, roots: string[] = [], ar = ""): Passage => ({ key, ar, en, enMukhtasar: "", arMuyassar: "", roots });
const passages = [
  P("1:1", "praise and mercy"),
  P("2:1", "water from the sky gives life", ["موه"], "ماء"),
  P("2:2", "rain falls", ["موه"]),
  P("3:1", "hands and deeds", ["يدي"], "يد"),
  P("3:2", "mountains as pegs"),
];
async function index(withEmbeddings: boolean): Promise<RagIndex> {
  const embeddings = withEmbeddings ? await new StubEmbedder().embed(passages.map(passageText), "document") : null;
  return {
    manifest: { builtAt: "", sources: { quran: "", translation: "", tafsir: "" }, embedding: null, passages: passages.length },
    manifestSha256: "x",
    passages,
    lexicon: { ماء: ["موه"], يد: ["يدي"], ايدي: ["يدي"] },
    embeddings,
  };
}

describe("queries", () => {
  it("builds a concept query from its labels and aliases", () => {
    const q = queryForConcept("hand");
    expect(q.concept).toBe("hand");
    expect(q.text).toMatch(/Hand/);
    expect(q.arTerms).toEqual(["اليد"]);
  });
  it("rejects unknown concepts", () => {
    expect(() => queryForConcept("no_such_thing")).toThrow(/no_such_thing/);
  });
  it("takes Arabic words out of a free description", () => {
    expect(queryForText("warm shower").arTerms).toEqual([]);
    expect(queryForText("ماء دافئ").arTerms).toEqual(["ماء", "دافي"]);
  });
});

describe("root channel", () => {
  it("maps Arabic spelling variants to the same root", async () => {
    const idx = await index(false);
    for (const term of ["اليد", "يَد", "أيدي"]) expect(queryRoots({ text: "", arTerms: [term], concept: null }, idx.lexicon)).toEqual(["يدي"]);
  });
  it("returns every ayah with the root, in Tanzil order, and nothing for unknown words", async () => {
    const idx = await index(false);
    expect(rootChannel({ text: "", arTerms: ["الماء"], concept: null }, idx)).toEqual(["2:1", "2:2"]);
    expect(rootChannel({ text: "", arTerms: ["كلمة"], concept: null }, idx)).toEqual([]);
  });
});

describe("keyword channel (BM25)", () => {
  it("ranks the passage with the rarer matching term first", async () => {
    const idx = await index(false);
    expect(keywordChannel(queryForText("water sky"), idx, buildBm25(idx))[0]).toBe("2:1");
  });
  it("returns nothing when no term matches", () => {
    expect(new Bm25([["a1"], ["b1"]]).search(["zz"])).toEqual([]);
  });
});

describe("fusion", () => {
  it("is deterministic and breaks ties by Tanzil order", () => {
    const order = new Map(passages.map((p, i) => [p.key, i]));
    const a = fuse([["2:2", "2:1"], ["2:1", "2:2"]], order);
    expect(a).toEqual(["2:1", "2:2"]);
    expect(fuse([["2:2", "2:1"], ["2:1", "2:2"]], order)).toEqual(a);
    expect(fuse([["3:1"], ["2:1"]], order)).toEqual(["2:1", "3:1"]);
  });
});

describe("retrieve", () => {
  it("records which channel found each key", async () => {
    const idx = await index(true);
    const r = await retrieve({ text: "water", arTerms: ["ماء"], concept: null }, idx, { bm25: buildBm25(idx), embedder: new StubEmbedder() });
    expect(r.keys[0]).toBe("2:1");
    expect(r.foundBy["2:1"]).toMatchObject({ root: 1, keywords: 1 });
    expect(r.channelsMissing).toEqual([]);
  });
  it("continues without the meaning channel and says so", async () => {
    const idx = await index(false);
    const r = await retrieve(queryForText("water"), idx, { bm25: buildBm25(idx), embedder: null });
    expect(r.channelsMissing).toEqual(["meaning"]);
    expect(r.keys).toContain("2:1");
  });
  it("treats a failing embedder as a missing channel", async () => {
    const idx = await index(true);
    const failing = { model: "x", embed: async () => { throw new Error("Voyage 503"); } };
    const r = await retrieve(queryForText("water"), idx, { bm25: buildBm25(idx), embedder: failing });
    expect(r.channelsMissing).toEqual(["meaning"]);
  });
});

describe("root lexicon built from Uthmani database forms (review finding 1)", () => {
  // Word forms as the database may store them: Uthmani marks, dagger alef, a bare proclitic. Single words only.
  const lexicon = buildLexicon([
    { form: "بِأَيْدِى", root: "يدي" },
    { form: "يَدُ", root: "يدي" },
    { form: "ٱلسَّمَٰوَٰتِ", root: "سمو" },
  ]);
  const roots = (term: string) => queryRoots({ text: "", arTerms: [term], concept: null }, lexicon);

  it("finds the root of a form that only occurs with و/ف/ب/ل in front", () => {
    expect(roots("أيدي")).toEqual(["يدي"]);
    expect(roots("اليد")).toEqual(["يدي"]);
    expect(roots("يَد")).toEqual(["يدي"]);
  });
  it("matches modern spelling against a dagger alef, and the spelling without it", () => {
    expect(roots("السماوات")).toEqual(["سمو"]);
    expect(roots("السموات")).toEqual(["سمو"]);
  });
});
