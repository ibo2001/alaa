import { join } from "node:path";
import type { SourceBundle } from "@/lib/guard";
import { loadSources } from "@/lib/sources/load";
import { costUsd } from "@/lib/vision/pricing";
import { INDEX_DIR, TAFSIR_DIR, TAFSIR_FILE, TOP_FUSED, voyageSettings } from "./config";
import { VoyageEmbedder, type Embedder } from "./embed";
import { currentSourceHashes, readIndex, type RagIndex } from "./index-store";
import { ClaudeReranker, type Reranker } from "./rerank";
import { buildBm25, type Bm25 } from "./retrieve";
import { readTafsir, verifyTafsir, type TafsirTexts } from "./tafsir";

/** Upper-bound estimate: ~30 candidates × ~150 tokens + instructions in, ~250 tokens out, per question. */
export function estimateCost(questions: number, model: string): number | null {
  const perQuestion = costUsd(model, { input: TOP_FUSED * 150 + 400, output: 250, cacheWrite: 0, cacheRead: 0 });
  return perQuestion === null ? null : perQuestion * questions;
}

export async function openSession(opts: { root?: string } = {}): Promise<{
  index: RagIndex;
  bm25: Bm25;
  embedder: Embedder | null;
  reranker: Reranker;
  bundle: SourceBundle;
  tafsir: TafsirTexts;
}> {
  const root = opts.root ?? process.cwd();
  const tafsirManifest = await verifyTafsir(root);
  const bundle = loadSources(root);
  const index = readIndex(join(root, INDEX_DIR), currentSourceHashes(bundle, tafsirManifest));
  const voyage = voyageSettings();
  const embedder =
    voyage && index.manifest.embedding?.model === voyage.model ? new VoyageEmbedder(voyage.apiKey, voyage.model) : null;
  if (voyage && index.manifest.embedding && index.manifest.embedding.model !== voyage.model) {
    console.warn(`VOYAGE_MODEL (${voyage.model}) differs from the index (${index.manifest.embedding.model}); meaning channel off`);
  }
  return {
    index,
    bm25: buildBm25(index),
    embedder,
    reranker: new ClaudeReranker(),
    bundle,
    tafsir: readTafsir(join(root, TAFSIR_DIR, TAFSIR_FILE)).texts,
  };
}
