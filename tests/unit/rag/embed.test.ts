import { describe, expect, it, vi } from "vitest";
import { dot, StubEmbedder, VoyageEmbedder } from "@/rag/embed";

describe("StubEmbedder", () => {
  it("is deterministic and unit-length, and shared words mean higher similarity", async () => {
    const e = new StubEmbedder();
    const [a, b, c] = await e.embed(["water rain", "rain water", "mountain"], "document");
    expect(dot(a!, a!)).toBeCloseTo(1, 5);
    expect(dot(a!, b!)).toBeCloseTo(1, 5);
    expect(dot(a!, c!)).toBeLessThan(0.5);
  });
});

describe("VoyageEmbedder", () => {
  it("sends batches with the input type and returns vectors in input order", async () => {
    const calls: { input: string[]; model: string; input_type: string }[] = [];
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init!.body));
      calls.push(body);
      const data = body.input.map((_: string, i: number) => ({ index: i, embedding: [i + 1, 0] })).reverse();
      return new Response(JSON.stringify({ data }), { status: 200 });
    });
    const e = new VoyageEmbedder("key", "voyage-test", fetchImpl as unknown as typeof fetch);
    const out = await e.embed(Array.from({ length: 70 }, (_, i) => `t${i}`), "query");
    expect(calls).toHaveLength(2); // 64 + 6
    expect(calls[0]!.input_type).toBe("query");
    expect(calls[0]!.model).toBe("voyage-test");
    expect(out).toHaveLength(70);
    expect(out[0]![0]).toBeCloseTo(1); // unit vector of [1, 0]
  });

  it("retries on 429 and then succeeds", async () => {
    let n = 0;
    const fetchImpl = vi.fn(async () => {
      n++;
      if (n === 1) return new Response("slow down", { status: 429 });
      return new Response(JSON.stringify({ data: [{ index: 0, embedding: [0, 1] }] }), { status: 200 });
    });
    const e = new VoyageEmbedder("key", "m", fetchImpl as unknown as typeof fetch, 0);
    await expect(e.embed(["x"], "document")).resolves.toHaveLength(1);
    expect(n).toBe(2);
  });

  it("throws after repeated failures", async () => {
    const fetchImpl = vi.fn(async () => new Response("down", { status: 503 }));
    const e = new VoyageEmbedder("key", "m", fetchImpl as unknown as typeof fetch, 0);
    await expect(e.embed(["x"], "document")).rejects.toThrow(/Voyage 503/);
  });
});
