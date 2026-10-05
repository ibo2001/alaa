import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { hashedTranslation, parseQuranEncXml } from "@/lib/quran/quranenc";

const FILE = "sources/translations/en.rwwad/english_rwwad_v1.0.19-xml.1.xml";
const xml = readFileSync(FILE, "utf8");

describe("QuranEnc XML translation", () => {
  const parsed = parseQuranEncXml(xml);

  it("reads every ayah of the Quran, with the version from the file", () => {
    expect(parsed.texts.size).toBe(6236);
    expect(parsed.version).toBe("v1.0.19-xml.1");
  });

  it("keeps the translation and its footnotes exactly as published", () => {
    const text = parsed.texts.get("1:2")!;
    expect(text).toContain("[1]");
    const notes = parsed.notes.get("1:2")!;
    expect(notes.startsWith("[1] ")).toBe(true);
    // Both are byte-for-byte slices of the file: nothing added, nothing removed.
    expect(xml).toContain(text);
    expect(xml).toContain(notes);
  });

  it("ayat without footnotes have no notes entry", () => {
    expect(parsed.notes.has("1:1")).toBe(false);
  });

  it("the Guard hash covers the footnotes too, so changing a note is detected", () => {
    const t = parsed.texts.get("1:2")!;
    const n = parsed.notes.get("1:2")!;
    expect(hashedTranslation(t, n)).not.toBe(hashedTranslation(t, n + " "));
    expect(hashedTranslation(t, undefined)).toBe(t);
  });
});
