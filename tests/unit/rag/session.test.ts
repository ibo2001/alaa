import { describe, expect, it } from "vitest";
import { estimateCost } from "@/rag/session";

describe("estimateCost", () => {
  it("scales with the number of questions and knows Haiku's price", () => {
    const one = estimateCost(1, "claude-haiku-4-5-20251001")!;
    expect(one).toBeGreaterThan(0.001);
    expect(one).toBeLessThan(0.05);
    expect(estimateCost(10, "claude-haiku-4-5-20251001")).toBeCloseTo(one * 10, 10);
  });
  it("returns null for a model without a known price", () => {
    expect(estimateCost(1, "unknown-model")).toBeNull();
  });
});
