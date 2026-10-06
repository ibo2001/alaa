import { describe, expect, it } from "vitest";
import { wrapLines } from "@/lib/sharecard";

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
});

describe("share card icons", () => {
  it("has a line icon for every blessing", async () => {
    const { hasIcon } = await import("@/lib/sharecard-icons");
    const { blessings } = await import("@/lib/sources/data");
    expect(blessings.filter((b) => !hasIcon(b.id)).map((b) => b.id)).toEqual([]);
  });
});
