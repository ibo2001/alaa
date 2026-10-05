/**
 * Quick check of the vision endpoint over a folder of images (the full 3-run evaluation is eval/run.ts, Day 3).
 *
 *   npx tsx eval/quick.ts [folder=eval/images] [--url=http://localhost:3000/api/see]
 *     Uploads every image (downscaled to 768px, like the app does) and prints the decision.
 *     If the folder has labels.json ({ "file.jpg": "concept_id" | "abstain" }), it also scores them.
 *
 *   npx tsx eval/quick.ts [folder] --raw
 *     Runs the configured provider directly (no server) and prints the raw candidates and confidences.
 *
 *   npx tsx eval/quick.ts --record
 *     Runs the configured provider (VISION_PROVIDER / VISION_MODEL, needs ANTHROPIC_API_KEY) directly on
 *     public/samples/ and writes the raw results to public/samples/cache.json for instant demo results.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}`));
const url = flag("url")?.split("=")[1] ?? "http://localhost:3000/api/see";
const folder = args.find((a) => !a.startsWith("--")) ?? "eval/images";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

async function downscale(path: string): Promise<Buffer> {
  return sharp(path).rotate().resize(768, 768, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
}

async function record() {
  const { getVisionProvider } = await import("../lib/vision");
  const { samples } = await import("../lib/vision/samples");
  const provider = getVisionProvider();
  const model = provider.name === "anthropic" ? (process.env.VISION_MODEL || "default") : provider.name;
  const results: Record<string, unknown> = {};
  for (const s of samples) {
    const data = await downscale(join("public", s.file));
    const result = await provider.recognize({ data, mediaType: "image/jpeg" }, { sampleId: s.id });
    results[s.id] = { result, model, recordedAt: new Date().toISOString() };
    console.log(s.id.padEnd(16), JSON.stringify(result.candidates));
  }
  const path = "public/samples/cache.json";
  const file = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, JSON.stringify({ ...file, results }, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(results).length} results to ${path}`);
}

async function raw() {
  const { getVisionProvider } = await import("../lib/vision");
  const provider = getVisionProvider();
  for (const f of readdirSync(folder).filter((f) => IMAGE_EXT.has(extname(f).toLowerCase())).sort()) {
    const r = await provider.recognize({ data: await downscale(join(folder, f)), mediaType: "image/jpeg" });
    const cands = r.candidates.map((c) => `${c.concept} ${c.confidence.toFixed(2)}`).join(", ");
    console.log(`${f.padEnd(28)} ${r.is_person ? "[person] " : ""}${r.unsafe ? "[unsafe] " : ""}${cands}`);
  }
}

async function quick() {
  if (!existsSync(folder)) throw new Error(`No folder ${folder}`);
  const files = readdirSync(folder).filter((f) => IMAGE_EXT.has(extname(f).toLowerCase())).sort();
  const labelsPath = join(folder, "labels.json");
  const labels: Record<string, string | string[]> = existsSync(labelsPath) ? JSON.parse(readFileSync(labelsPath, "utf8")) : {};
  let scored = 0;
  let correct = 0;

  for (const f of files) {
    const started = Date.now();
    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(await downscale(join(folder, f)))], { type: "image/jpeg" }), f);
    const res = await fetch(url, { method: "POST", body: form, headers: { cookie: "alaa_device=eval" } });
    const body = (await res.json()) as { decision?: { kind: string; concept?: string; candidates?: { concept: string }[] }; error?: string };
    const ms = Date.now() - started;
    const d = body.decision;
    const summary = !d
      ? `ERROR ${body.error}`
      : d.kind === "card"
        ? `card ${d.concept}`
        : d.kind === "confirm"
          ? `confirm ${d.candidates?.map((c) => c.concept).join("/")}`
          : `abstain${d.concept ? ` (${d.concept})` : ""}`;
    let mark = "";
    const expected = labels[f];
    if (expected && d) {
      scored++;
      // A label is "abstain" or one/several acceptable concept ids.
      const accepted = new Set(Array.isArray(expected) ? expected : [expected]);
      const ok =
        expected === "abstain" || (d.kind === "abstain" && accepted.has("abstain"))
          ? d.kind === "abstain"
          : d.kind === "card"
            ? accepted.has(d.concept ?? "")
            : d.kind === "confirm" && !!d.candidates?.some((c) => accepted.has(c.concept));
      if (ok) correct++;
      mark = ok ? " ✓" : ` ✗ expected ${[expected].flat().join("|")}`;
    }
    console.log(`${f.padEnd(28)} ${summary.padEnd(40)} ${String(ms).padStart(5)} ms${mark}`);
  }
  if (scored) console.log(`\n${correct}/${scored} correct or correctly abstained (${Math.round((100 * correct) / scored)}%)`);
}

(flag("record") ? record() : flag("raw") ? raw() : quick()).catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
