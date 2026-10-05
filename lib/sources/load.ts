// Server/build-time only: reads the source files from disk. Never import from client components.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseTanzil, type TextManifest } from "@/lib/quran/tanzil";
import { parseTranslationFile } from "@/lib/quran/quranenc";
import type { SourceBundle, TranslationSource } from "@/lib/guard";
import { translationRegistry } from "./translations";

const QURAN_FILE = "sources/quran/quran-uthmani.txt";
const QURAN_MANIFEST = "sources/quran/manifest.json";

let cached: SourceBundle | null = null;

function readJson<T>(path: string): T | null {
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : null;
}

export function loadSources(root: string = process.cwd()): SourceBundle {
  if (cached && root === process.cwd()) return cached;

  const quranManifest = readJson<TextManifest>(join(root, QURAN_MANIFEST));
  if (!quranManifest) throw new Error(`Missing ${QURAN_MANIFEST}; run: npx tsx scripts/build-manifest.ts`);

  const translations: Record<string, TranslationSource> = {};
  for (const meta of Object.values(translationRegistry)) {
    const dir = join(root, meta.dir);
    const file = join(dir, meta.file);
    const parsed = existsSync(file) ? parseTranslationFile(meta.format, readFileSync(file, "utf8")) : null;
    translations[meta.id] = {
      meta,
      texts: parsed?.texts ?? null,
      notes: parsed?.notes ?? new Map(),
      manifest: readJson<TextManifest>(join(dir, "manifest.json")),
      licensePresent: existsSync(join(dir, "LICENSE")),
    };
  }

  const bundle: SourceBundle = {
    quran: parseTanzil(readFileSync(join(root, QURAN_FILE), "utf8")),
    quranManifest,
    translations,
  };
  if (root === process.cwd()) cached = bundle;
  return bundle;
}
