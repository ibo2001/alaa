/**
 * Builds the RAG index from the verified local sources.
 *
 *   npx tsx rag/build-index.ts                       # verify sources, build passages, lexicon, embeddings
 *   npx tsx rag/build-index.ts --pin-tafsir=<release> # once, after Ibrahim adds sources/tafsir/quran.db
 *   npx tsx rag/build-index.ts --no-embeddings        # roots + keywords only
 *
 * Reads VOYAGE_API_KEY / VOYAGE_MODEL from .env.local; without them the index has no embeddings.
 */
import { loadEnvConfig } from "@next/env";
import { join } from "node:path";
import { loadSources } from "@/lib/sources/load";
import { INDEX_DIR, TAFSIR_DIR, TAFSIR_FILE, voyageSettings } from "./config";
import { passageText, VoyageEmbedder } from "./embed";
import { currentSourceHashes, writeIndex } from "./index-store";
import { buildLexicon, buildPassages } from "./passages";
import { pinTafsir, readTafsir, verifyTafsir } from "./tafsir";

loadEnvConfig(process.cwd());
const args = process.argv.slice(2);

async function main() {
  const pin = args.find((a) => a.startsWith("--pin-tafsir="))?.split("=")[1];
  if (pin) {
    const m = await pinTafsir(pin);
    console.log(`Pinned ${TAFSIR_DIR}/${TAFSIR_FILE} (${m.sha256}) as release ${pin}`);
    return;
  }
  const tafsirManifest = await verifyTafsir();
  const bundle = loadSources();
  const tafsir = readTafsir(join(TAFSIR_DIR, TAFSIR_FILE));
  const passages = buildPassages(bundle, tafsir);
  const lexicon = buildLexicon(tafsir.forms);
  console.log(`${passages.length} passages, ${Object.keys(lexicon).length} word forms`);

  const voyage = args.includes("--no-embeddings") ? null : voyageSettings();
  let embeddings: Float32Array[] | null = null;
  if (voyage) {
    console.log(`Embedding with ${voyage.model}…`);
    embeddings = await new VoyageEmbedder(voyage.apiKey, voyage.model).embed(passages.map(passageText), "document");
  } else {
    console.log("No embeddings (VOYAGE_API_KEY/VOYAGE_MODEL not set or --no-embeddings): roots + keywords only");
  }
  const manifest = writeIndex(INDEX_DIR, {
    sources: currentSourceHashes(bundle, tafsirManifest),
    passages,
    lexicon,
    embeddings,
    embeddingModel: voyage?.model ?? null,
  });
  console.log(`Wrote ${INDEX_DIR}/ (manifest: ${JSON.stringify(manifest.embedding)})`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
