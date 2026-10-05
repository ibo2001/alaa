/**
 * Full evaluation (SPEC §11): every labelled image × N runs, for Alaa's constrained call and for the
 * alternative "free labels + manual mapping" approach. Reports accuracy (correct or correctly abstained),
 * consistency across runs, latency and cost per image from the API's token usage.
 *
 *   npx tsx eval/run.ts [folder=eval/images] [--runs=3] [--approach=both|constrained|alt]
 *
 * Needs ANTHROPIC_API_KEY and VISION_MODEL (read from .env.local). Each image is downscaled to 768px
 * like the app does. Writes eval/results/<timestamp>.json and eval/results/latest.md.
 * Labels: eval/images/labels.json, { "file.jpg": "concept_id" | ["accepted", "ids"] | "abstain" }.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";
import { AnthropicVisionProvider } from "../lib/vision/anthropic";
import { decide, type Decision } from "../lib/vision/decide";
import { costUsd } from "../lib/vision/pricing";
import type { VisionResult } from "../lib/vision/types";
import { recognizeFreeLabels } from "./alt";

// Load .env.local without printing it (the key never leaves this process).
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && process.env[m[1]!] === undefined) process.env[m[1]!] = m[2]!.replace(/^"|"$/g, "");
  }
}

const args = process.argv.slice(2);
const opt = (name: string, dflt: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? dflt;
const folder = args.find((a) => !a.startsWith("--")) ?? "eval/images";
const runs = Number(opt("runs", "3"));
const approach = opt("approach", "both");
const model = process.env.VISION_MODEL || "claude-haiku-4-5";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

type Label = string | string[];
type Call = { decision: string; ok: boolean; ms: number; cost: number | null; detail?: string };
type Row = { file: string; expected: Label; calls: Call[] };

const summary = (d: Decision) =>
  d.kind === "card" ? `card ${d.concept}` : d.kind === "confirm" ? `confirm ${d.candidates.map((c) => c.concept).join("/")}` : `abstain`;

function correct(expected: Label, d: Decision): boolean {
  if (expected === "abstain") return d.kind === "abstain";
  const accepted = new Set([expected].flat());
  if (d.kind === "abstain") return accepted.has("abstain"); // e.g. ["abstain", "tree"] for an ambiguous photo
  if (d.kind === "card") return accepted.has(d.concept);
  if (d.kind === "confirm") return d.candidates.some((c) => accepted.has(c.concept));
  return false;
}

async function downscale(path: string): Promise<Buffer> {
  return sharp(path).rotate().resize(768, 768, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
}

async function main() {
  const labels: Record<string, Label> = JSON.parse(readFileSync(join(folder, "labels.json"), "utf8"));
  const files = readdirSync(folder)
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
    .sort();
  const unlabelled = files.filter((f) => !(f in labels));
  if (unlabelled.length) console.log(`Skipping ${unlabelled.length} unlabelled: ${unlabelled.join(", ")}\n`);
  const items = files.filter((f) => f in labels);

  const client = new Anthropic({ timeout: 30_000, maxRetries: 2 });
  const constrained = new AnthropicVisionProvider(model, client);
  const approaches: Record<string, (img: Buffer) => Promise<VisionResult & { names?: string[] }>> = {};
  if (approach !== "alt") approaches.constrained = (data) => constrained.recognize({ data, mediaType: "image/jpeg" });
  if (approach !== "constrained") approaches.alt = (data) => recognizeFreeLabels(client, model, { data, mediaType: "image/jpeg" });

  const results: Record<string, Row[]> = {};
  for (const [name, recognize] of Object.entries(approaches)) {
    console.log(`== ${name} · ${model} · ${items.length} images × ${runs} runs`);
    results[name] = [];
    for (const file of items) {
      const data = await downscale(join(folder, file));
      const row: Row = { file, expected: labels[file]!, calls: [] };
      for (let r = 0; r < runs; r++) {
        const t = Date.now();
        try {
          const res = await recognize(data);
          const d = decide(res);
          row.calls.push({
            decision: summary(d),
            ok: correct(row.expected, d),
            ms: Date.now() - t,
            cost: res.usage ? costUsd(model, res.usage) : null,
            detail: res.names?.join(", "),
          });
        } catch (e) {
          row.calls.push({ decision: `error ${(e as Error).name}`, ok: false, ms: Date.now() - t, cost: null });
        }
      }
      results[name].push(row);
      const marks = row.calls.map((c) => (c.ok ? "✓" : "✗")).join("");
      console.log(`${file.padEnd(40)} ${marks}  ${row.calls[0]!.decision}${row.calls[0]!.detail ? `  [${row.calls[0]!.detail}]` : ""}`);
    }
    console.log();
  }

  // Metrics
  const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : "–");
  const lines: string[] = [];
  const stamp = new Date().toISOString();
  lines.push(`# Evaluation results`, ``, `${stamp} · model \`${model}\` · ${items.length} labelled images × ${runs} runs · folder \`${folder}\``, ``);
  lines.push(`| Approach | Correct or correctly abstained | Consistent across runs | Median latency | p95 latency | Cost per image |`);
  lines.push(`|---|---|---|---|---|---|`);
  const metrics: Record<string, unknown> = {};
  for (const [name, rows] of Object.entries(results)) {
    const calls = rows.flatMap((r) => r.calls);
    const ok = calls.filter((c) => c.ok).length;
    const consistent = rows.filter((r) => new Set(r.calls.map((c) => c.decision)).size === 1).length;
    const ms = calls.map((c) => c.ms).sort((a, b) => a - b);
    const q = (p: number) => ms[Math.min(ms.length - 1, Math.floor(p * ms.length))] ?? 0;
    const costs = calls.map((c) => c.cost).filter((c): c is number => c !== null);
    const avgCost = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : null;
    metrics[name] = { calls: calls.length, correct: ok, consistentImages: consistent, images: rows.length, medianMs: q(0.5), p95Ms: q(0.95), avgCostUsd: avgCost };
    const label = name === "constrained" ? "Alaa: closed list, forced tool call" : "Alternative: free labels + manual mapping";
    lines.push(
      `| ${label} | ${ok}/${calls.length} (${pct(ok, calls.length)}) | ${consistent}/${rows.length} (${pct(consistent, rows.length)}) | ${(q(0.5) / 1000).toFixed(1)} s | ${(q(0.95) / 1000).toFixed(1)} s | ${avgCost === null ? "–" : `$${avgCost.toFixed(5)}`} |`,
    );
  }
  lines.push(``, `## Per image`, ``);
  for (const [name, rows] of Object.entries(results)) {
    lines.push(`### ${name}`, ``, `| Image | Expected | Runs | First decision |`, `|---|---|---|---|`);
    for (const r of rows) {
      lines.push(`| ${r.file} | ${[r.expected].flat().join(" / ")} | ${r.calls.map((c) => (c.ok ? "✓" : "✗")).join("")} | ${r.calls[0]!.decision}${r.calls[0]!.detail ? ` (named: ${r.calls[0]!.detail})` : ""} |`);
    }
    lines.push(``);
  }

  mkdirSync("eval/results", { recursive: true });
  const base = `eval/results/${stamp.replace(/[:.]/g, "-")}`;
  writeFileSync(`${base}.json`, JSON.stringify({ stamp, model, folder, runs, metrics, results }, null, 2) + "\n");
  writeFileSync("eval/results/latest.md", lines.join("\n") + "\n");
  console.log(lines.slice(0, 4 + Object.keys(results).length + 2).join("\n"));
  console.log(`\nWrote ${base}.json and eval/results/latest.md`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
