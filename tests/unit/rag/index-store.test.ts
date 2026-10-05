import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { IndexError, readIndex, writeIndex, type SourceHashes } from "@/rag/index-store";
import type { Passage } from "@/rag/passages";

const sources: SourceHashes = { quran: "q1", translation: "t1", tafsir: "d1" };
const passages: Passage[] = [
  { key: "1:1", ar: "a", en: "b", enMukhtasar: "", arMuyassar: "", roots: [] },
  { key: "1:2", ar: "c", en: "d", enMukhtasar: "", arMuyassar: "", roots: ["حمد"] },
];

describe("index store", () => {
  it("round-trips passages, lexicon and embeddings", () => {
    const dir = mkdtempSync(join(tmpdir(), "alaa-idx-"));
    const emb = [Float32Array.from([1, 0]), Float32Array.from([0, 1])];
    writeIndex(dir, { sources, passages, lexicon: { حمد: ["حمد"] }, embeddings: emb, embeddingModel: "stub", now: new Date("2026-10-06T06:00:00Z") });
    const idx = readIndex(dir, sources);
    expect(idx.passages).toEqual(passages);
    expect(idx.lexicon).toEqual({ حمد: ["حمد"] });
    expect(idx.embeddings![1]![1]).toBe(1);
    expect(idx.manifest.embedding).toEqual({ model: "stub", dimensions: 2 });
    expect(idx.manifestSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("works without embeddings", () => {
    const dir = mkdtempSync(join(tmpdir(), "alaa-idx-"));
    writeIndex(dir, { sources, passages, lexicon: {}, embeddings: null, embeddingModel: null });
    expect(readIndex(dir, sources).embeddings).toBeNull();
  });

  it("stops when any source changed after the build", () => {
    const dir = mkdtempSync(join(tmpdir(), "alaa-idx-"));
    writeIndex(dir, { sources, passages, lexicon: {}, embeddings: null, embeddingModel: null });
    expect(() => readIndex(dir, { ...sources, translation: "t2" })).toThrow(IndexError);
    expect(() => readIndex(dir, { ...sources, translation: "t2" })).toThrow(/npx tsx rag\/build-index\.ts/);
  });

  it("stops when the index is missing or incomplete", () => {
    const dir = mkdtempSync(join(tmpdir(), "alaa-idx-"));
    expect(() => readIndex(dir, sources)).toThrow(/npx tsx rag\/build-index\.ts/);
    writeIndex(dir, { sources, passages, lexicon: {}, embeddings: [Float32Array.from([1]), Float32Array.from([1])], embeddingModel: "stub" });
    rmSync(join(dir, "embeddings.f32"));
    expect(() => readIndex(dir, sources)).toThrow(IndexError);
  });
});
