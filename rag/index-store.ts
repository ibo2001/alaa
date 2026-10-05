// rag/index/: passages.jsonl, lexicon.json, embeddings.f32 (git-ignored) and manifest.json (committed).
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "@/lib/quran/tanzil";
import type { SourceBundle } from "@/lib/guard";
import { TRANSLATION_ID } from "./config";
import type { Passage } from "./passages";
import type { TafsirManifest } from "./tafsir";

export type SourceHashes = { quran: string; translation: string; tafsir: string };
export type IndexManifest = {
  builtAt: string;
  sources: SourceHashes;
  embedding: { model: string; dimensions: number } | null;
  passages: number;
  /** SHA-256 of each git-ignored data file, so a committed manifest never vouches for other data. */
  files: Record<string, string>;
};
export type RagIndex = {
  manifest: IndexManifest;
  manifestSha256: string;
  passages: Passage[];
  lexicon: Record<string, string[]>;
  embeddings: Float32Array[] | null;
};

export class IndexError extends Error {
  constructor(message: string) {
    super(`${message}; rebuild with \`npx tsx rag/build-index.ts\``);
    this.name = "IndexError";
  }
}

const fileHash = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

export function currentSourceHashes(bundle: SourceBundle, tafsir: TafsirManifest): SourceHashes {
  const tr = bundle.translations[TRANSLATION_ID]?.manifest;
  if (!tr) throw new Error(`Missing manifest for ${TRANSLATION_ID}`);
  return { quran: bundle.quranManifest.fileSha256, translation: tr.fileSha256, tafsir: tafsir.sha256 };
}

export function writeIndex(
  dir: string,
  data: {
    sources: SourceHashes;
    passages: Passage[];
    lexicon: Record<string, string[]>;
    embeddings: Float32Array[] | null;
    embeddingModel: string | null;
    now?: Date;
  },
): IndexManifest {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "passages.jsonl"), data.passages.map((p) => JSON.stringify(p)).join("\n") + "\n");
  writeFileSync(join(dir, "lexicon.json"), JSON.stringify(data.lexicon));
  let embedding: IndexManifest["embedding"] = null;
  if (data.embeddings && data.embeddingModel) {
    const dims = data.embeddings[0]?.length ?? 0;
    const all = new Float32Array(dims * data.embeddings.length);
    data.embeddings.forEach((v, i) => all.set(v, i * dims));
    writeFileSync(join(dir, "embeddings.f32"), Buffer.from(all.buffer));
    embedding = { model: data.embeddingModel, dimensions: dims };
  }
  const names = ["passages.jsonl", "lexicon.json", ...(embedding ? ["embeddings.f32"] : [])];
  const manifest: IndexManifest = {
    builtAt: (data.now ?? new Date()).toISOString(),
    sources: data.sources,
    embedding,
    passages: data.passages.length,
    files: Object.fromEntries(names.map((n) => [n, fileHash(join(dir, n))])),
  };
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

export function readIndex(dir: string, expected: SourceHashes): RagIndex {
  const mPath = join(dir, "manifest.json");
  if (!existsSync(mPath) || !existsSync(join(dir, "passages.jsonl"))) throw new IndexError("No RAG index found");
  const raw = readFileSync(mPath, "utf8");
  const manifest = JSON.parse(raw) as IndexManifest;
  for (const k of ["quran", "translation", "tafsir"] as const) {
    if (manifest.sources[k] !== expected[k]) throw new IndexError(`The index was built from a different ${k} file`);
  }
  if (!manifest.files) throw new IndexError("The index manifest has no data-file hashes");
  for (const [name, hash] of Object.entries(manifest.files)) {
    const path = join(dir, name);
    if (!existsSync(path)) throw new IndexError(`${name} is missing`);
    if (fileHash(path) !== hash) throw new IndexError(`${name} does not belong to this index manifest`);
  }
  const passages = readFileSync(join(dir, "passages.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Passage);
  if (passages.length !== manifest.passages) throw new IndexError("passages.jsonl does not match the manifest");
  const lexicon = JSON.parse(readFileSync(join(dir, "lexicon.json"), "utf8")) as Record<string, string[]>;

  let embeddings: Float32Array[] | null = null;
  if (manifest.embedding) {
    const ePath = join(dir, "embeddings.f32");
    if (!existsSync(ePath)) throw new IndexError("embeddings.f32 is missing");
    const buf = readFileSync(ePath);
    const all = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
    const d = manifest.embedding.dimensions;
    if (all.length !== d * passages.length) throw new IndexError("embeddings.f32 does not match the manifest");
    embeddings = passages.map((_, i) => all.slice(i * d, (i + 1) * d));
  }
  return { manifest, manifestSha256: sha256(raw), passages, lexicon, embeddings };
}
