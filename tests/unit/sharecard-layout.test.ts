import { describe, expect, it } from "vitest";
import { CARD_HEIGHT, layoutCard, QR_SIZE, VERSE_SIZES, type LayoutItem } from "@/lib/sharecard-layout";

// Fake text metrics: every character is half the font size wide. Placeholder words only, never verse text.
const measure = (s: string, px: number) => s.length * px * 0.5;
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}x`).join(" ");
const item = (id: string, verseWords: number | null): LayoutItem => ({
  id,
  label: `label ${id}`,
  ref: `ref ${id}`,
  passages: verseWords === null ? null : [words(verseWords)],
});
const refrain = words(4);

describe("share card layout", () => {
  it("draws every passage whole: the lines join back to the exact text", () => {
    const items = [item("a", 6), item("b", 20)];
    const l = layoutCard({ items, refrain, measure });
    for (const p of l.items) {
      if (!p.verse) continue;
      p.verse.passages.forEach((lines, i) => expect(lines.join(" ")).toBe(p.item.passages![i]));
    }
    expect(l.refrain.lines.join(" ")).toBe(refrain);
  });

  it("shows short verses for a few blessings at the largest size", () => {
    const l = layoutCard({ items: [item("a", 4), item("b", 5), item("c", 6)], refrain, measure });
    expect(l.items.every((p) => p.verse !== null)).toBe(true);
    expect(l.verseSize).toBe(VERSE_SIZES[0]);
    expect(l.rest).toBe(0);
  });

  it("never gives a verse to a mapping under review", () => {
    const l = layoutCard({ items: [item("a", 4), item("draft", null)], refrain, measure });
    expect(l.items.find((p) => p.item.id === "draft")!.verse).toBeNull();
    expect(l.items.find((p) => p.item.id === "a")!.verse).not.toBeNull();
  });

  it("drops the longest verse first when everything cannot fit", () => {
    const items = [item("short", 4), item("long1", 30), item("long2", 31), item("long3", 29), item("mid", 12)];
    const l = layoutCard({ items, refrain, measure });
    const shown = (id: string) => l.items.find((p) => p.item.id === id)!.verse !== null;
    expect(shown("short")).toBe(true);
    expect(shown("long2")).toBe(false);
    // A shorter verse is never dropped while a longer one stays.
    const kept = l.items.filter((p) => p.verse).map((p) => p.item.passages![0]!.length);
    const dropped = l.items.filter((p) => !p.verse && p.item.passages).map((p) => p.item.passages![0]!.length);
    if (kept.length && dropped.length) expect(Math.max(...kept)).toBeLessThanOrEqual(Math.min(...dropped));
  });

  it("fits inside the card for 1 to 12 blessings with long verses, and names every blessing somewhere", () => {
    for (let n = 1; n <= 12; n++) {
      const items = Array.from({ length: n }, (_, i) => item(`b${i}`, 31));
      const l = layoutCard({ items, refrain, measure });
      expect(l.items.length + l.also.names.length + l.rest).toBe(n);
      expect(l.items.length).toBeLessThanOrEqual(6);
      expect(l.inviteY + QR_SIZE).toBeLessThanOrEqual(CARD_HEIGHT);
      const end = l.also.ys.at(-1) ?? l.items.at(-1)!.refY;
      expect(end).toBeLessThanOrEqual(l.contentBottom);
      expect(l.items[0]!.top).toBeGreaterThanOrEqual(l.contentTop);
    }
  });

  it("puts blessings that do not get a block into 'also today', in order, with nothing hidden for 8", () => {
    const items = Array.from({ length: 8 }, (_, i) => item(`b${i}`, 31));
    const l = layoutCard({ items, refrain, measure });
    expect(l.rest).toBe(0);
    expect([...l.items.map((p) => p.item.label), ...l.also.names]).toEqual(items.map((i) => i.label));
    expect(l.also.lines.join(" ")).toContain(l.also.names[0]!);
  });

  it("keeps several passages of one card (verses from different surahs) together or not at all", () => {
    const two: LayoutItem = { id: "two", label: "two", ref: "r", passages: [words(5), words(6)] };
    const l = layoutCard({ items: [two], refrain, measure });
    expect(l.items[0]!.verse!.passages).toHaveLength(2);
  });
});
