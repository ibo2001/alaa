import { describe, expect, it } from "vitest";
import { decide } from "@/lib/vision/decide";
import { parseVisionResult } from "@/lib/vision/schema";

const r = (candidates: [string, number][], extra: { is_person?: boolean; unsafe?: boolean } = {}) => ({
  candidates: candidates.map(([concept, confidence]) => ({ concept, confidence })),
  is_person: extra.is_person ?? false,
  unsafe: extra.unsafe ?? false,
});

describe("decide: thresholds", () => {
  it("≥ 0.75 with a blessing → card", () => {
    expect(decide(r([["drinking_water", 0.93]]))).toEqual({ kind: "card", concept: "drinking_water", blessingId: "drinking-water" });
  });

  it("related concepts open the same blessing", () => {
    expect(decide(r([["palm_tree", 0.8]]))).toMatchObject({ kind: "card", blessingId: "dates-palms" });
  });

  it("0.45–0.75 → 'Is this…?' with up to 3 candidates", () => {
    const d = decide(r([["milk", 0.6], ["water", 0.5], ["honey", 0.46], ["fig", 0.3]]));
    expect(d.kind).toBe("confirm");
    if (d.kind === "confirm") expect(d.candidates.map((c) => c.concept)).toEqual(["milk", "water", "honey"]);
  });

  it("< 0.45 → abstain", () => {
    expect(decide(r([["sky", 0.44]]))).toEqual({ kind: "abstain", reason: "low-confidence" });
  });

  it("'none' is never a candidate", () => {
    expect(decide(r([["none", 0.95]]))).toEqual({ kind: "abstain", reason: "low-confidence" });
  });

  it("confident but not in the database (keyboard) → abstain with the concept", () => {
    expect(decide(r([["keyboard", 0.97]]))).toEqual({ kind: "abstain", reason: "no-blessing", concept: "keyboard" });
  });

  it("two confident objects with different blessings (dates next to water) → choose", () => {
    const d = decide(r([["date_fruit", 0.9], ["drinking_water", 0.85]]));
    expect(d.kind).toBe("confirm");
  });
});

describe("decide: safety", () => {
  it("unsafe → abstain, whatever the candidates", () => {
    expect(decide(r([["water", 0.99]], { unsafe: true }))).toEqual({ kind: "abstain", reason: "unsafe" });
  });

  it("person → only eye/hand may be offered", () => {
    expect(decide(r([["clothing", 0.9]], { is_person: true }))).toEqual({ kind: "abstain", reason: "person" });
    expect(decide(r([["eye", 0.9], ["clothing", 0.8]], { is_person: true }))).toMatchObject({ kind: "card", concept: "eye" });
  });
});

describe("vision output validation", () => {
  it("drops concepts outside the closed list and clamps confidence", () => {
    const parsed = parseVisionResult({
      candidates: [{ concept: "unicorn", confidence: 0.99 }, { concept: "water", confidence: 1.4 }],
      is_person: false,
      unsafe: false,
    });
    expect(parsed.candidates).toEqual([{ concept: "water", confidence: 1 }]);
  });

  it("never offers 'family' (would require describing people)", () => {
    expect(parseVisionResult({ candidates: [{ concept: "family", confidence: 0.9 }], is_person: true, unsafe: false }).candidates).toEqual([]);
  });

  it("rejects malformed output", () => {
    expect(() => parseVisionResult({ candidates: "water" })).toThrow();
  });
});
