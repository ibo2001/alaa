// Writes src/media.json: the length (in frames at 30 fps) of every clip and voice line in public/.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";

const FPS = 30;
const dur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
const out = {};
for (const dir of ["clips", "voice", "footage"]) {
  const d = `public/${dir}`;
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d).filter((f) => /\.(mp4|mp3|wav|webm|mov)$/.test(f))) out[`${dir}/${f}`] = Math.round(dur(`${d}/${f}`) * FPS);
}
writeFileSync("src/media.json", JSON.stringify(out, null, 2) + "\n");
console.log(out);
