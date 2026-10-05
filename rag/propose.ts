/**
 * Candidate packets for the religious reviewer (references only; nothing is adopted automatically).
 *
 *   npx tsx rag/propose.ts --concept hand
 *   npx tsx rag/propose.ts --query "warm shower"
 *   npx tsx rag/propose.ts --open [--yes]        # every draft card; prints the cost estimate and asks first
 *
 * Writes rag/packets/<date>-<slug>.json and .md. Read the .md before sending anything to the reviewer.
 */
import { loadEnvConfig } from "@next/env";
import { createInterface } from "node:readline/promises";
import { PACKET_DIR, rerankModel } from "./config";
import { proposeOne, writePacket } from "./packet";
import { draftBlessings, queryForBlessing, queryForConcept, queryForText, type Query } from "./retrieve";
import { estimateCost, openSession } from "./session";
import { costUsd } from "@/lib/vision/pricing";

loadEnvConfig(process.cwd());
const args = process.argv.slice(2);
const value = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

async function confirm(n: number): Promise<boolean> {
  const est = estimateCost(n, rerankModel());
  console.log(`${n} questions · re-ranker ${rerankModel()} · estimated cost ${est === null ? "unknown" : `≈ $${est.toFixed(3)}`}`);
  if (args.includes("--yes")) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Continue? [y/N] ");
  rl.close();
  return answer.trim().toLowerCase() === "y";
}

async function main() {
  const queries: Query[] = [];
  const concept = value("--concept");
  const query = value("--query");
  if (concept) queries.push(queryForConcept(concept));
  else if (query) queries.push(queryForText(query));
  else if (args.includes("--open")) queries.push(...draftBlessings().map(queryForBlessing));
  else throw new Error('Use --concept <id>, --query "<text>" or --open');

  if (queries.length > 1 && !(await confirm(queries.length))) return;

  const session = await openSession();
  const date = new Date().toISOString().slice(0, 10);
  let spent = 0;
  for (const q of queries) {
    const { packet, usage } = await proposeOne(q, session);
    const paths = writePacket(PACKET_DIR, packet, date);
    if (usage) spent += costUsd(session.reranker.model, usage) ?? 0;
    console.log(`${packet.status === "ok" ? "✓" : "∅"} ${packet.concept ?? packet.query}: ${packet.candidates.map((c) => c.key).join(", ") || "no strong match"} → ${paths.md}`);
  }
  console.log(`Re-ranker cost: $${spent.toFixed(4)}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
