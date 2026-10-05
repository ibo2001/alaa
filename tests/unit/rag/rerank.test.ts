import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { ClaudeReranker, parseRerank, rerankToolSchema } from "@/rag/rerank";
import type { Passage } from "@/rag/passages";

const keys = ["2:1", "2:2", "3:1"];

describe("parseRerank (the output guard)", () => {
  it("keeps known keys, sorted by score", () => {
    expect(parseRerank({ ranked: [{ ayah: "2:2", score: 0.4 }, { ayah: "2:1", score: 0.9 }] }, keys)).toEqual([
      { key: "2:1", score: 0.9 },
      { key: "2:2", score: 0.4 },
    ]);
  });
  it("drops foreign and duplicate keys, clamps scores, caps the list at 8", () => {
    // Dedup keeps the first occurrence, here the highest score (12, clamped to 1).
    const many = Array.from({ length: 12 }, (_, i) => ({ ayah: "2:1", score: 12 - i }));
    expect(parseRerank({ ranked: [{ ayah: "9:9", score: 1 }, ...many, { ayah: "3:1", score: 7 }] }, keys)).toEqual([
      { key: "2:1", score: 1 },
      { key: "3:1", score: 1 },
    ]);
    const twelveKeys = Array.from({ length: 12 }, (_, i) => `1:${i + 1}`);
    expect(parseRerank({ ranked: twelveKeys.map((k) => ({ ayah: k, score: 0.5 })) }, twelveKeys)).toHaveLength(8);
  });
  it("accepts an empty list", () => {
    expect(parseRerank({ ranked: [] }, keys)).toEqual([]);
  });
  it("rejects any text field, at any level", () => {
    expect(() => parseRerank({ ranked: [{ ayah: "2:1", score: 1, why: "text" }] }, keys)).toThrow();
    expect(() => parseRerank({ ranked: [], note: "text" }, keys)).toThrow();
  });
  it("the tool schema is a closed enum of the input keys with no string fields besides it", () => {
    const s = rerankToolSchema(keys);
    expect(s.properties.ranked.items.properties.ayah.enum).toEqual(keys);
    expect(Object.keys(s.properties.ranked.items.properties)).toEqual(["ayah", "score"]);
    expect(s.properties.ranked.items.additionalProperties).toBe(false);
    expect(s.additionalProperties).toBe(false);
  });
});

describe("ClaudeReranker", () => {
  const passages: Passage[] = keys.map((key) => ({ key, ar: "", en: `meaning ${key}`, enMukhtasar: "", arMuyassar: "", roots: [] }));
  const fakeClient = (input: unknown) =>
    ({
      messages: {
        create: async () => ({
          stop_reason: "tool_use",
          content: [{ type: "tool_use", name: "rank_ayat", id: "t", input }],
          usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        }),
      },
    }) as unknown as Anthropic;

  it("returns the guarded ranking and token usage", async () => {
    const r = await new ClaudeReranker("claude-haiku-4-5-20251001", fakeClient({ ranked: [{ ayah: "3:1", score: 0.8 }] })).rank(
      { text: "hand", arTerms: [], concept: "hand" },
      passages,
    );
    expect(r.items).toEqual([{ key: "3:1", score: 0.8 }]);
    expect(r.usage).toEqual({ input: 100, output: 20, cacheWrite: 0, cacheRead: 0 });
  });

  it("throws when the model answers with text fields", async () => {
    const rr = new ClaudeReranker("claude-haiku-4-5-20251001", fakeClient({ ranked: [{ ayah: "3:1", score: 0.8, text: "x" }] }));
    await expect(rr.rank({ text: "hand", arTerms: [], concept: null }, passages)).rejects.toThrow();
  });
});
