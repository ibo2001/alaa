import { describe, expect, it } from "vitest";
import { firstHitRank, summarize, truthPairs } from "@/rag/eval-metrics";

describe("truth pairs", () => {
  const pairs = truthPairs();
  it("has the 14 reviewed mappings and the 8 reviewer suggestions", () => {
    expect(pairs.filter((p) => p.origin === "reviewed-mapping")).toHaveLength(14);
    expect(pairs.filter((p) => p.origin === "reviewer-suggestion")).toHaveLength(8);
  });
  it("expands ranges and multi-reference cards into every ayah key", () => {
    expect(pairs.find((p) => p.id === "drinking-water")!.expect).toEqual(["56:68", "56:69", "56:70"]);
    expect(pairs.find((p) => p.id === "eyes-tongue")!.expect).toEqual(["67:23", "30:22"]);
  });
});

describe("metrics", () => {
  it("counts a hit on any expected key, 1-based", () => {
    expect(firstHitRank(["1:1", "56:69", "56:68"], ["56:68", "56:69", "56:70"])).toBe(2);
    expect(firstHitRank(["1:1"], ["2:2"])).toBeNull();
  });
  it("computes recall@k and MRR", () => {
    expect(summarize([1, 4, null, 10], 8)).toEqual({ recall: 0.5, mrr: (1 + 0.25) / 4, n: 4 });
  });
});
