import { describe, expect, it } from "vitest";
import { fitItems, wrapLines } from "@/lib/sharecard";

const measure = (s: string) => s.length * 10;

describe("share card layout", () => {
  it("wraps without dropping or changing any word", () => {
    const text = "one two three four five six seven eight";
    const lines = wrapLines(measure, text, 120);
    expect(lines.join(" ")).toBe(text);
    for (const l of lines) expect(measure(l) <= 120 || !l.includes(" ")).toBe(true);
  });

  it("keeps a single long word on its own line instead of cutting it", () => {
    expect(wrapLines(measure, "a verylongwordthatdoesnotfit b", 50)).toEqual(["a", "verylongwordthatdoesnotfit", "b"]);
  });

  it("draws at most 7 blessings and counts the rest", () => {
    expect(fitItems([1, 2, 3])).toEqual({ shown: [1, 2, 3], rest: 0 });
    const many = fitItems(Array.from({ length: 10 }, (_, i) => i));
    expect(many.shown).toHaveLength(7);
    expect(many.rest).toBe(3);
  });
});
