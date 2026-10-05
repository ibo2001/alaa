import { describe, expect, it } from "vitest";
import { arabicVariants, isArabic, normalizeArabic, stripHtml, stripMarkers, tokenize } from "@/rag/text";

describe("normalizeArabic", () => {
  it("removes diacritics, tatweel and Uthmani small letters", () => {
    expect(normalizeArabic("يَدٌ")).toBe("يد");
    expect(normalizeArabic("مـــاء")).toBe("ماء");
    expect(normalizeArabic("ٱلْمَآءِ")).toBe("الماء");
    expect(normalizeArabic("ذَٰلِكَ")).toBe("ذلك");
  });
  it("unifies alef, hamza seats, alef maqsura and ta marbuta", () => {
    expect(normalizeArabic("أيدي")).toBe("ايدي");
    expect(normalizeArabic("إنسان")).toBe("انسان");
    expect(normalizeArabic("هدى")).toBe("هدي");
    expect(normalizeArabic("نعمة")).toBe("نعمه");
    expect(normalizeArabic("مؤمن")).toBe("مومن");
  });
});

describe("arabicVariants", () => {
  it("adds the form without a leading article or conjunction + article", () => {
    expect(arabicVariants("اليد")).toEqual(["اليد", "يد"]);
    expect(arabicVariants("والشمس")).toEqual(["والشمس", "شمس"]);
    expect(arabicVariants("بالماء")).toEqual(["بالماء", "ماء"]);
  });
  it("never strips to fewer than two letters and leaves Latin words alone", () => {
    expect(arabicVariants("الا")).toEqual(["الا"]);
    expect(arabicVariants("water")).toEqual(["water"]);
  });
});

describe("tokenize", () => {
  it("lowercases, normalises, splits and drops stopwords and one-letter tokens", () => {
    expect(tokenize("The Water, and a HAND")).toEqual(["water", "hand"]);
    expect(tokenize("في الْمَاء")).toEqual(["الماء"]);
  });
  it("detects Arabic tokens", () => {
    expect(isArabic("يد")).toBe(true);
    expect(isArabic("hand")).toBe(false);
  });
});

describe("stripping", () => {
  it("removes footnote markers and HTML tags", () => {
    expect(stripMarkers("deny?[3] (13)")).toBe("deny? (13)");
    expect(stripHtml("<p>a <b>b</b></p>")).toBe("a b");
  });
});
