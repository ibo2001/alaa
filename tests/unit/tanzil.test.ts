import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { expandRef, parseTanzil, sha256 } from "@/lib/quran/tanzil";
import { loadSources } from "@/lib/sources/load";

describe("Tanzil parser", () => {
  it("skips comment and blank lines and keeps the text as-is", () => {
    const parsed = parseTanzil("# comment\n\n1|1|alpha beta\n#trailing\n2|3|gamma|delta\n");
    expect([...parsed.entries()]).toEqual([
      ["1:1", "alpha beta"],
      ["2:3", "gamma|delta"],
    ]);
  });

  it("expands ayah ranges", () => {
    expect(expandRef({ surah: 56, ayah: 68, ayahEnd: 70 })).toEqual(["56:68", "56:69", "56:70"]);
  });

  it("loads all 6236 ayat from the real Tanzil file", () => {
    expect(loadSources().quran.size).toBe(6236);
  });

  it("manifest matches the committed Tanzil file byte-for-byte", () => {
    const { quranManifest } = loadSources();
    const content = readFileSync(quranManifest.source, "utf8");
    expect(sha256(content)).toBe(quranManifest.fileSha256);
  });
});
