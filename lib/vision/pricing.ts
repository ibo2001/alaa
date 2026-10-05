import type { Usage } from "./types";

// Anthropic first-party prices in USD per million tokens (source: Anthropic's model table, cached 2026-09-25).
// Cache writes cost 1.25× input, cache reads 0.1× input. Matched by model-id prefix (dated ids included).
const PRICES: { prefix: string; input: number; output: number }[] = [
  { prefix: "claude-haiku-4-5", input: 1, output: 5 },
  { prefix: "claude-sonnet-5-5", input: 2, output: 10 },
  { prefix: "claude-sonnet-4-5", input: 3, output: 15 },
  { prefix: "claude-opus-5-5", input: 4, output: 20 },
];

export function costUsd(model: string, usage: Usage): number | null {
  const p = PRICES.find((x) => model.startsWith(x.prefix));
  if (!p) return null;
  const perToken = (rate: number) => rate / 1_000_000;
  return (
    usage.input * perToken(p.input) +
    usage.cacheWrite * perToken(p.input * 1.25) +
    usage.cacheRead * perToken(p.input * 0.1) +
    usage.output * perToken(p.output)
  );
}
