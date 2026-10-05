/**
 * Retrieval evaluation (spec §8): recall@8 and MRR of the reviewer's verse among the candidates, per channel
 * and end to end, plus re-ranker scores of hits vs non-hits to set SCORE_THRESHOLD.
 *
 *   npx tsx rag/eval.ts [--no-rerank]
 *
 * Writes rag/results/<timestamp>.json and rag/results/latest.md. Report numbers as measured.
 */
import { loadEnvConfig } from "@next/env";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { costUsd } from "@/lib/vision/pricing";
import { RESULTS_DIR, TOP_FINAL, TOP_FUSED } from "./config";
import { firstHitRank, summarize, truthPairs } from "./eval-metrics";
import { proposeOne } from "./packet";
import { keywordChannel, meaningChannel, retrieve, rootChannel } from "./retrieve";
import { openSession } from "./session";

loadEnvConfig(process.cwd());
const noRerank = process.argv.includes("--no-rerank");

async function main() {
  const s = await openSession();
  const pairs = truthPairs();
  type Row = {
    id: string;
    origin: string;
    expect: string[];
    channels: Record<string, number | null>;
    fusedRank: number | null;
    finalRank: number | null;
    scores: { key: string; score: number | null; hit: boolean }[];
  };
  const rows: Row[] = [];
  let cost = 0;
  for (const p of pairs) {
    const channels: Record<string, number | null> = {
      root: firstHitRank(rootChannel(p.query, s.index), p.expect),
      keywords: firstHitRank(keywordChannel(p.query, s.index, s.bm25), p.expect),
      meaning: s.embedder && s.index.embeddings ? firstHitRank(await meaningChannel(p.query, s.index, s.embedder), p.expect) : null,
    };
    const fused = await retrieve(p.query, s.index, { bm25: s.bm25, embedder: s.embedder });
    // Threshold 0 here: the evaluation sees every re-ranked candidate, so it can propose the threshold.
    const { packet, usage } = await proposeOne(p.query, { ...s, reranker: noRerank ? null : s.reranker, threshold: 0 });
    if (usage) cost += costUsd(s.reranker.model, usage) ?? 0;
    const finalKeys = packet.candidates.map((c) => c.key);
    rows.push({
      id: p.id,
      origin: p.origin,
      expect: p.expect,
      channels,
      fusedRank: firstHitRank(fused.keys, p.expect),
      finalRank: firstHitRank(finalKeys, p.expect),
      scores: packet.candidates.map((c) => ({ key: c.key, score: c.score, hit: p.expect.includes(c.key) })),
    });
    console.log(`${p.id}: fused ${rows.at(-1)!.fusedRank ?? "—"} · final ${rows.at(-1)!.finalRank ?? "—"}`);
  }

  const by = (f: (r: Row) => number | null, k: number) => summarize(rows.map(f), k);
  const metrics = {
    final: by((r) => r.finalRank, TOP_FINAL),
    fused: by((r) => r.fusedRank, TOP_FUSED),
    root: by((r) => r.channels.root ?? null, TOP_FUSED),
    keywords: by((r) => r.channels.keywords ?? null, TOP_FUSED),
    meaning: by((r) => r.channels.meaning ?? null, TOP_FUSED),
    costPerQuestion: cost / pairs.length,
  };
  const hitScores = rows.flatMap((r) => r.scores.filter((x) => x.hit).map((x) => x.score));
  const otherScores = rows.flatMap((r) => r.scores.filter((x) => !x.hit).map((x) => x.score));

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync(RESULTS_DIR, { recursive: true });
  const out = { stamp, indexManifest: s.index.manifest, reranker: noRerank ? null : s.reranker.model, metrics, hitScores, otherScores, rows };
  writeFileSync(join(RESULTS_DIR, `${stamp}.json`), JSON.stringify(out, null, 2) + "\n");
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const md = [
    `# RAG retrieval evaluation · ${stamp}`,
    "",
    `${pairs.length} pairs (reviewed mappings + reviewer suggestions) · embeddings: ${s.index.manifest.embedding?.model ?? "none"} · re-ranker: ${out.reranker ?? "off"}`,
    "",
    "| Stage | Recall | MRR |",
    "|---|---|---|",
    `| Final candidates (top ${TOP_FINAL}) | ${pct(metrics.final.recall)} | ${metrics.final.mrr.toFixed(2)} |`,
    `| Fused (top ${TOP_FUSED}) | ${pct(metrics.fused.recall)} | ${metrics.fused.mrr.toFixed(2)} |`,
    `| Roots only (top ${TOP_FUSED}) | ${pct(metrics.root.recall)} | ${metrics.root.mrr.toFixed(2)} |`,
    `| Keywords only (top ${TOP_FUSED}) | ${pct(metrics.keywords.recall)} | ${metrics.keywords.mrr.toFixed(2)} |`,
    `| Meaning only (top ${TOP_FUSED}) | ${pct(metrics.meaning.recall)} | ${metrics.meaning.mrr.toFixed(2)} |`,
    "",
    `Re-ranker cost per question: $${metrics.costPerQuestion.toFixed(4)}`,
    "",
    `Re-ranker scores of hits: ${hitScores.map((x) => x?.toFixed(2)).join(", ") || "—"}  `,
    `Re-ranker scores of other candidates (min/median/max): ${otherScores.length ? describe(otherScores as number[]) : "—"}`,
    "",
    "Caveat: a small set, and some pairs were chosen with the current data in view.",
  ].join("\n");
  writeFileSync(join(RESULTS_DIR, "latest.md"), md + "\n");
  console.log("\n" + md);
}

function describe(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  return `${s[0]!.toFixed(2)} / ${s[Math.floor(s.length / 2)]!.toFixed(2)} / ${s.at(-1)!.toFixed(2)}`;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
