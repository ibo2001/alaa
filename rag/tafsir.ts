// The Tafsir Center for Quranic Studies database (data CC BY 4.0, code MIT), added by Ibrahim to
// sources/tafsir/. Used for Arabic roots and tafsir evidence for the reviewer only. Its own Quran text
// (word_content_rasm) is never read: Tanzil stays the only verse text.
import { createHash } from "node:crypto";
import { createReadStream, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { TAFSIR_DIR, TAFSIR_FILE, TAFSIR_UPSTREAM_SHA256 } from "./config";

// node:sqlite through require: works the same under tsx and Vitest.
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as typeof import("node:sqlite");

export type TafsirSourceId = "al-Muyassar" | "al-Mukhtasar (Arabic)" | "al-Mukhtasar (English)";
export type TafsirTexts = Map<string, Partial<Record<TafsirSourceId, string>>>;
export type TafsirData = { rootsByAyah: Map<string, Set<string>>; forms: { form: string; root: string }[]; texts: TafsirTexts };
export type TafsirManifest = { file: string; sha256: string; source: string; version: string; obtained: string; license: string };

export const TAFSIR_ATTRIBUTION = "Tafsir Center for Quranic Studies · CC BY 4.0";

export class TafsirError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TafsirError";
  }
}

export function fileSha256(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(path)
      .on("data", (c) => h.update(c))
      .on("end", () => resolve(h.digest("hex")))
      .on("error", reject);
  });
}

const paths = (root: string) => {
  const dir = join(root, TAFSIR_DIR);
  return { dir, db: join(dir, TAFSIR_FILE), license: join(dir, "LICENSE"), manifest: join(dir, "manifest.json") };
};

/** Checks the database, its LICENSE and its pinned hash. Stops (throws) on any problem; never repairs. */
export async function verifyTafsir(root: string = process.cwd()): Promise<TafsirManifest> {
  const p = paths(root);
  const where = `${TAFSIR_DIR}/${TAFSIR_FILE}`;
  if (!existsSync(p.db)) throw new TafsirError(`Missing ${where}: Ibrahim adds the Tafsir Center database (file quran.db) there, with its LICENSE.`);
  if (!existsSync(p.license)) throw new TafsirError(`Missing ${TAFSIR_DIR}/LICENSE (CC BY 4.0 data licence of the Tafsir Center database).`);
  if (!existsSync(p.manifest)) throw new TafsirError(`Missing ${TAFSIR_DIR}/manifest.json: run npx tsx rag/build-index.ts --pin-tafsir=<release>`);
  const manifest = JSON.parse(readFileSync(p.manifest, "utf8")) as TafsirManifest;
  const actual = await fileSha256(p.db);
  if (actual !== manifest.sha256) {
    throw new TafsirError(`${where} does not match its manifest.\n  expected ${manifest.sha256}\n  actual   ${actual}`);
  }
  return manifest;
}

/** Writes manifest.json for a database whose hash equals the upstream project's pinned hash. */
export async function pinTafsir(version: string, root: string = process.cwd()): Promise<TafsirManifest> {
  const p = paths(root);
  if (!existsSync(p.db)) throw new TafsirError(`Missing ${TAFSIR_DIR}/${TAFSIR_FILE}`);
  const sha256 = await fileSha256(p.db);
  if (sha256 !== TAFSIR_UPSTREAM_SHA256) {
    throw new TafsirError(`Hash ${sha256} is not the upstream pinned hash ${TAFSIR_UPSTREAM_SHA256}; ask Ibrahim which release this is.`);
  }
  const manifest: TafsirManifest = {
    file: TAFSIR_FILE,
    sha256,
    source: "Hugging Face dataset tafsircenter/tafsir-mcp-data (https://github.com/tafsircenter/tafsir-mcp)",
    version,
    obtained: new Date().toISOString().slice(0, 10),
    license: "Data CC BY 4.0 (Tafsir Center for Quranic Studies); code MIT",
  };
  writeFileSync(p.manifest, JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

type RootRow = { surahNo: number; ayahNo: number; root: string; wordText: string };
type MuyassarRow = { sura: number; aya: number; tafsir: string | null };
type MukhtasarRow = { surahNo: number; ayahNo: number; Mukhtasarar: string | null; Mukhtasaren: string | null };

/** Reads everything the index needs in three queries. Call only after verifyTafsir(). */
export function readTafsir(dbPath: string): TafsirData {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    const rootsByAyah = new Map<string, Set<string>>();
    const forms: { form: string; root: string }[] = [];
    const rows = db.prepare("SELECT surahNo, ayahNo, root, wordText FROM word_statistics WHERE root IS NOT NULL AND root <> ''").all() as RootRow[];
    for (const r of rows) {
      const key = `${r.surahNo}:${r.ayahNo}`;
      if (!rootsByAyah.has(key)) rootsByAyah.set(key, new Set());
      rootsByAyah.get(key)!.add(r.root);
      if (r.wordText) forms.push({ form: r.wordText, root: r.root });
    }

    const texts: TafsirTexts = new Map();
    const entry = (key: string) => {
      if (!texts.has(key)) texts.set(key, {});
      return texts.get(key)!;
    };
    for (const r of db.prepare("SELECT sura, aya, tafsir FROM tafsir_moyassar").all() as MuyassarRow[]) {
      const e = entry(`${r.sura}:${r.aya}`);
      if (r.tafsir) e["al-Muyassar"] = r.tafsir;
    }
    for (const r of db.prepare("SELECT surahNo, ayahNo, Mukhtasarar, Mukhtasaren FROM QuranTafseer").all() as MukhtasarRow[]) {
      const e = entry(`${r.surahNo}:${r.ayahNo}`);
      if (r.Mukhtasarar) e["al-Mukhtasar (Arabic)"] = r.Mukhtasarar;
      if (r.Mukhtasaren) e["al-Mukhtasar (English)"] = r.Mukhtasaren;
    }
    return { rootsByAyah, forms, texts };
  } finally {
    db.close();
  }
}
