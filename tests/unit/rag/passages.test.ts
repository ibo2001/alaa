import { describe, expect, it } from "vitest";
import { loadSources } from "@/lib/sources/load";
import { buildLexicon, buildPassages } from "@/rag/passages";
import type { TafsirData } from "@/rag/tafsir";

const bundle = loadSources();
const tafsir: TafsirData = {
  rootsByAyah: new Map([["16:53", new Set(["نعم"])]]),
  forms: [{ form: "نِعْمَةٍ", root: "نعم" }, { form: "ٱلْيَدِ", root: "يدي" }],
  texts: new Map([["16:53", { "al-Muyassar": "<p>placeholder</p>", "al-Mukhtasar (English)": "placeholder en" }]]),
};

describe("buildPassages", () => {
  const passages = buildPassages(bundle, tafsir);

  it("has one passage per ayah, in Tanzil order", () => {
    expect(passages).toHaveLength(6236);
    expect(passages[0]!.key).toBe("1:1");
    expect(passages.at(-1)!.key).toBe("114:6");
  });

  it("stores normalised copies for search, never the display text", () => {
    const p = passages.find((x) => x.key === "16:53")!;
    expect(p.ar).not.toBe(bundle.quran.get("16:53"));
    expect(p.ar).not.toMatch(/[ً-ٰٟ]/); // no diacritics left
    expect(p.en).not.toMatch(/\[\d+\]/); // footnote markers stripped
    expect(p.arMuyassar).toBe("placeholder");
    expect(p.enMukhtasar).toBe("placeholder en");
    expect(p.roots).toEqual(["نعم"]);
  });

  it("leaves tafsir fields empty where the database has nothing", () => {
    const p = passages.find((x) => x.key === "1:1")!;
    expect(p.arMuyassar).toBe("");
    expect(p.roots).toEqual([]);
  });
});

describe("buildLexicon", () => {
  it("maps each normalised form, with and without the article, to its roots", () => {
    const lex = buildLexicon(tafsir.forms);
    expect(lex["نعمه"]).toEqual(["نعم"]);
    expect(lex["اليد"]).toEqual(["يدي"]);
    expect(lex["يد"]).toEqual(["يدي"]);
  });
});
