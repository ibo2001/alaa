/**
 * Generates SHA-256 manifests (one hash per ayah + whole-file hash) for the Tanzil Quran text
 * and every registered translation. The source files are only read, never modified.
 *
 *   npx tsx scripts/build-manifest.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildManifest } from "../lib/quran/tanzil";
import translations from "../sources/translations/index.json";

const root = join(__dirname, "..");

function write(source: string, outFile: string) {
  const content = readFileSync(join(root, source), "utf8");
  const manifest = buildManifest(source, content);
  writeFileSync(join(root, outFile), JSON.stringify(manifest, null, 0) + "\n");
  console.log(`${outFile}: ${manifest.ayahCount} ayat, file sha256 ${manifest.fileSha256.slice(0, 12)}…`);
}

write("sources/quran/quran-uthmani.txt", "sources/quran/manifest.json");
for (const t of Object.values(translations)) {
  write(`${t.dir}/${t.file}`, `${t.dir}/manifest.json`);
}
