// Settings for the offline RAG reviewer's assistant (docs/superpowers/specs/2026-10-05-rag-reviewer-assistant-design.md).
export const TRANSLATION_ID = "en.rwwad";
export const TAFSIR_DIR = "sources/tafsir";
export const TAFSIR_FILE = "quran.db";
/** SHA-256 pinned by the upstream project (tafsircenter/tafsir-mcp, src/tafsir/data_loader.py). */
export const TAFSIR_UPSTREAM_SHA256 = "10e61f615ab5e6a3440e8ecc8ba1dc2273d12cd9048752760fe53a44d191cc27";
export const INDEX_DIR = "rag/index";
export const PACKET_DIR = "rag/packets";
export const RESULTS_DIR = "rag/results";

/** How many keys each channel contributes to fusion, how many fused keys go to the re-ranker, how many come back. */
export const CHANNEL_DEPTH = 100;
export const TOP_FUSED = 30;
export const TOP_FINAL = 8;
/** Reciprocal-rank fusion constant (the usual 60). */
export const RRF_K = 60;
/**
 * Re-ranker score below which a candidate is not shown. PROVISIONAL until the Phase 1 evaluation
 * (`npx tsx rag/eval.ts` prints the score distribution); then fixed here with a DECISIONS.md line.
 */
export const SCORE_THRESHOLD = 0.5;

export const rerankModel = () => process.env.RAG_RERANK_MODEL || "claude-haiku-4-5-20251001";
export const voyageSettings = () =>
  process.env.VOYAGE_API_KEY && process.env.VOYAGE_MODEL
    ? { apiKey: process.env.VOYAGE_API_KEY, model: process.env.VOYAGE_MODEL }
    : null;
