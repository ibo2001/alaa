import { expandRef } from "@/lib/quran/tanzil";
import { blessings } from "@/lib/sources/data";
import truth from "./eval-truth.json";
import { queryForBlessing, queryForConcept, type Query } from "./retrieve";

export type TruthPair = { id: string; query: Query; expect: string[]; origin: "reviewed-mapping" | "reviewer-suggestion" };

export function truthPairs(): TruthPair[] {
  const reviewed = blessings
    .filter((b) => b.review.mapping === "reviewed")
    .map((b) => ({ id: b.id, query: queryForBlessing(b), expect: b.verses.flatMap(expandRef), origin: "reviewed-mapping" as const }));
  const suggested = truth.suggestions.map((s) => ({
    id: `suggestion:${s.concept}`,
    query: queryForConcept(s.concept),
    expect: s.expect,
    origin: "reviewer-suggestion" as const,
  }));
  return [...reviewed, ...suggested];
}

export function firstHitRank(ranked: string[], expect: string[]): number | null {
  const i = ranked.findIndex((k) => expect.includes(k));
  return i < 0 ? null : i + 1;
}

export function summarize(ranks: (number | null)[], k: number): { recall: number; mrr: number; n: number } {
  const n = ranks.length;
  const hits = ranks.filter((r): r is number => r !== null && r <= k);
  return { recall: hits.length / n, mrr: hits.reduce((s, r) => s + 1 / r, 0) / n, n };
}
