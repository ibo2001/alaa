import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { blessings, concepts, data, recognizableConceptIds } from "@/lib/sources/data";
import { translationRegistry } from "@/lib/sources/translations";

describe("seed data integrity", () => {
  it("concept ids are unique and include 'none'", () => {
    const ids = concepts.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("none");
    expect(concepts.length).toBeGreaterThanOrEqual(100);
  });

  it("every blessing points to known concepts, each concept to at most one blessing", () => {
    const ids = new Set(concepts.map((c) => c.id));
    const seen = new Set<string>();
    for (const b of blessings) {
      for (const c of [b.concept, ...(b.relatedConcepts ?? [])]) {
        expect(ids.has(c), `${b.id} → ${c}`).toBe(true);
        expect(seen.has(c), `${c} mapped twice`).toBe(false);
        seen.add(c);
      }
    }
  });

  it("blessings hold references only, never text", () => {
    for (const b of blessings) {
      for (const v of b.verses) expect(Object.keys(v).sort()).toEqual(expect.arrayContaining(["ayah", "surah"]));
      for (const t of b.translations) expect(translationRegistry[t.source], t.source).toBeDefined();
    }
    expect(data.abstention.verses).toEqual([{ surah: 14, ayah: 34 }]);
  });

  it("concepts that need describing people are never offered to the model", () => {
    expect(recognizableConceptIds).not.toContain("family");
  });

  it("anything marked reviewed has an entry in REVIEW_LOG.md", () => {
    const log = readFileSync("sources/REVIEW_LOG.md", "utf8");
    for (const b of blessings) {
      if (b.review.mapping === "reviewed" || b.review.reflection === "reviewed") {
        expect(log, `${b.id} reviewed without a log entry`).toMatch(new RegExp(`\\|\\s*${b.id}\\s*\\|`));
      }
    }
  });
});

describe("surah names", () => {
  it("every referenced surah has a display name", async () => {
    const { hasSurahName } = await import("@/lib/quran/surahs");
    const refs = [...blessings.flatMap((b) => b.verses), ...data.abstention.verses, ...data.refrain.verses];
    for (const r of refs) expect(hasSurahName(r.surah), `surah ${r.surah}`).toBe(true);
  });
});
