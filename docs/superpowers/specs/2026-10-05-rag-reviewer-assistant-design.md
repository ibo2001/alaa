# Source-bound RAG: the reviewer's assistant (design)

**Status:** design approved section by section by Ibrahim on 2026-10-05; this document awaits his review. Nothing here is built yet.
**Relates to:** `docs/SPEC.en.md` §16 (source-bound RAG), `docs/ROADMAP.md` (voice input, scenes, hadith fallback), the challenge's reference framework (approved sources).

## 1. Intent

**Problem.** Choosing and refining concept → verse mappings depends on the religious reviewer answering one item at a time, with no structured way to find candidate verses. Today's examples: the hand (no verse names it as a blessing), replacements the reviewer asked for, and the four cards he has not reviewed yet.

**Goal.** A tool for the team and the reviewer that, for a concept or a short description ("hand", "warm shower"), retrieves candidate ayat from approved, licensed sources, shows each with its source text and verbatim tafsir as evidence, and lets the reviewer approve or reject. Approved references reach the app only through Ibrahim's decision, as today.

**Success.** The reviewer gets better candidates faster; the scholar's choice is usually among the top candidates (measured, §8); nothing reaches users without review.

**Decided with Ibrahim (2026-10-05):**
- Users: the reviewer's assistant first; runtime use (voice input) comes later, on top of the reviewed index only.
- Sources: a local, licensed, versioned snapshot (reproducible), not live calls.
- Retrieval: hybrid (Arabic roots + keywords + Voyage embeddings), Claude re-ranks keys only, verbatim tafsir as evidence.
- The Tafsir Center's database (behind its MCP server) is the tafsir and roots source.

**Non-goals.** No generated religious text anywhere. No candidates shown to app users. No automatic changes to `blessings.json`. Hadith, the photo scene layer and runtime voice retrieval are later phases (§9).

## 2. Architecture

```
 query (concept id or short description)
   │
   ▼
 ① Retriever (offline, local) ──► ~30 ayah keys, fused from three channels
      a. Roots:    query → Arabic root(s) → every ayah with that root (Tafsir database)
      b. Keywords: BM25 over Arabic (Tanzil), Rowwad English, al-Mukhtasar English
      c. Meaning:  Voyage embeddings over per-ayah passages
      fusion:      reciprocal-rank fusion (deterministic)
   │
   ▼
 ② Re-ranker (Claude, structured output) ──► up to 8 keys + scores
      output schema: [{ ayah: <enum of the ~30 input keys>, score: 0–1 }]; no text fields
   │
   ▼
 ③ Evidence (rendered at display time, never stored):
      Arabic from Tanzil via the Source Guard · Rowwad translation + footnotes (Guard level 2) ·
      verbatim tafsir excerpts (al-Muyassar, al-Mukhtasar) with
      "Tafsir Center for Quranic Studies · CC BY 4.0"
   │
   ▼
 ④ Review packet → reviewer: مناسبة / غير مناسبة / note / own suggestion
   │
   ▼
 ⑤ Ibrahim's decision → blessings.json + REVIEW_LOG.md (as today)
```

**Placement.** Tooling in `rag/` (outside the app bundle). Source files in `sources/`. Generated index in `rag/index/` (git-ignored, with a committed manifest). Packets in `rag/packets/` (committed). The app is unchanged except for one unlisted reviewer page (§5).

**Fixed rules.** Tanzil remains the only verse text any user sees; the Tafsir database's own Quran text is used for search only, never displayed. Tafsir appears only on the reviewer's page.

## 3. Data

### Sources
| Source | Location | In git |
|---|---|---|
| Tanzil Arabic text | `sources/quran/` (existing) | yes |
| Rowwad English translation + footnotes (QuranEnc v1.0.19-xml.1) | `sources/translations/en.rwwad/` (existing) | yes |
| Tafsir Center database: SQLite, data CC BY 4.0, code MIT (8 tafsirs incl. al-Muyassar, al-Sa'di, Ibn Kathir, al-Mukhtasar Arabic and English; 1,891 roots, word-level morphology) | `sources/tafsir/tafsir-mcp.sqlite` + `LICENSE` + `manifest.json` | database **no** (≈214 MB, over GitHub's 100 MB limit); LICENSE and manifest **yes** |

The tafsir `manifest.json` records release version, download URL, date and the file's SHA-256. Ibrahim adds the database and its licence (project rule: sources are added by him, not downloaded by the assistant).

### Passage table — `rag/index/passages.jsonl` (built, git-ignored)
One row per ayah (6,236):
```
{ key: "16:53", ar: <Tanzil, normalised for search>, en: <Rowwad, markers stripped for search>,
  enMukhtasar: <al-Mukhtasar English>, arMuyassar: <al-Muyassar>, roots: [<root ids>] }
```
Normalised copies serve search only; anything displayed is rendered from the original files through the Guard.

### Index — `rag/index/` (built, git-ignored)
- Embeddings: one vector per ayah (≈25 MB), Voyage multilingual model (exact model id fixed at build time and recorded).
- BM25: built in memory at start-up; no file.
- `rag/index/manifest.json` (committed): SHA-256 of every source used, embedding model id, build date.

### Candidate packet — `rag/packets/<date>-<slug>.json` (committed)
```
{ query: "hand", concept: "hand",
  candidates: [ { key: "16:53", score: 0.91,
                  found_by: { root: 3, keywords: 12, meaning: 1 },
                  evidence: { tafsir: [ { source: "al-Muyassar", ref: "16:53" } ] } } ],
  status: "ok" | "no-strong-match",
  built: { indexManifest: <sha256>, reranker: <model id>, channelsMissing: [], at: <time> } }
```
Packets hold references only (ayah keys, tafsir source + ayah), never text — the same rule as `blessings.json`. Decisions are added to the packet when the reviewer answers, giving a permanent record next to `REVIEW_LOG.md`.

## 4. Commands

| Command | Does |
|---|---|
| `npx tsx rag/build-index.ts` | Verifies source hashes, builds passages and embeddings, writes the index manifest |
| `npx tsx rag/propose.ts --concept hand` | One packet for a concept |
| `npx tsx rag/propose.ts --query "warm shower"` | One packet for a free description |
| `npx tsx rag/propose.ts --open` | Packets for every draft card and every open item at the end of `REVIEW_LOG.md` (prints the cost estimate first and asks to continue) |
| `npx tsx rag/eval.ts` | Retrieval evaluation (§8) |
| `npx tsx rag/answers.ts fetch` | Fetches the reviewer's answers and prepares, for Ibrahim's yes, the `blessings.json` change and the `REVIEW_LOG.md` row |

Each `propose` run also writes a short Markdown summary for us to read before sending a packet to the reviewer.

## 5. Review workflow

1. **Propose.** Ibrahim or the assistant runs `propose`; up to 8 ranked candidates per question.
2. **Review.** Unlisted page `/ar/review/candidates` (and `/en/…`), built from committed packets, styled like `/ar/review`. Per candidate: Arabic (Guard), Rowwad translation and footnotes, short verbatim tafsir excerpts with attribution. The reviewer marks «مناسبة» / «غير مناسبة», adds a note, or types his own suggestion. Answers are saved on his device and sent in one tap to the same private Google Form used by the review sheet. Voice notes remain possible (transcribed locally).
3. **Decide.** `answers.ts fetch` lists his answers; Ibrahim decides; only then is the change applied and logged, naming the packet that proposed the verse.
4. **Record.** The packet keeps proposals and decisions; `REVIEW_LOG.md` keeps the review.

## 6. Safety rules (enforced in code)

1. **Re-ranker cannot produce text.** Output schema = closed enum of that query's input keys + a number; no string fields; unknown keys dropped. A hostile query can at most reorder candidates.
2. **All displayed content comes from verified files.** Tanzil (Guard level 1), Rowwad + footnotes (level 2), tafsir only if the database hash matches its manifest. A failing candidate is dropped and logged, never repaired.
3. **Labelled as proposals.** «مقترحات آلية — لم تُراجَع بعد» on every candidate; page unlisted, `noindex`, not linked from the app.
4. **No padding.** Below a score threshold (set from the Phase 1 evaluation, then fixed in config) the packet reports `no-strong-match` rather than filling slots.
5. **No automatic adoption.** Only Ibrahim's yes, after the reviewer's approval, changes `blessings.json`.
6. **Hadith out of scope here;** when added: sahih only, collection, number and grade shown, own hash check.
7. **No personal data.** Packets contain team queries only; future user queries follow the app's privacy rule (processed, never stored).

## 7. Errors

| Problem | Behaviour |
|---|---|
| Tafsir database missing or hash mismatch | Stop; print the file name, location and expected hash |
| Index older than sources (manifest hashes differ) | Stop; "rebuild with `npx tsx rag/build-index.ts`" |
| Voyage unavailable | Continue with roots + keywords; packet lists `meaning` under `channelsMissing` |
| Re-ranker fails | Keep fused order; packet records "not re-ranked" |
| Large run | Print estimated cost (tokens × published prices) and ask to continue |

## 8. Testing and evaluation

**Automated tests (offline; stub embeddings and stub re-ranker, so CI needs no keys):** passage builder covers 6,236 ayat and display never uses normalised text; root channel returns known ayat and nothing for unknown words; fusion is deterministic; re-ranker guard drops foreign keys and rejects text fields; evidence builder fails closed on altered Tanzil, translation, footnote or database hash; `no-strong-match` below threshold.

**Retrieval evaluation (`rag/eval.ts`, results in `rag/results/`, reported as measured).** Ground truth from decisions already made: the reviewed mappings (e.g. water → 21:30, hand → 16:53) and the reviewer's suggested verses (sun-moon → 14:33, sky → 2:22, stars → 6:97, trees → 36:80, sea → 16:14, night-day → 28:73, mountains → 16:81, pomegranate → 6:99): about 22 pairs. Metrics: recall@8 (scholar's verse among the candidates), MRR (how high), cost per question. Caveat: a small set, and some pairs were chosen with the current data in view.

## 9. Phasing

| Phase | Scope | Needs |
|---|---|---|
| 0 | Tafsir database + LICENSE in `sources/tafsir/`; Voyage API key in `.env.local` | Ibrahim |
| 1 | `build-index`, `propose` (packets + Markdown summary), `eval` on the ~22 pairs | — |
| 2 | Reviewer candidates page, form sending, `answers.ts` apply helper | a reviewer trial |
| 3 (later) | Hadith fallback (HadeethEnc / Dorar), photo scene layer, runtime retrieval over the reviewed index for voice input | separate decisions |

During the challenge this document is the deliverable for the "planned" column; Phase 1 starts only if Day 3 leaves time after evaluation and submission.

## 10. Open items
- Exact Voyage model id and its Arabic quality (check on the ~22 pairs before committing to it).
- Tafsir database release to pin (version and hash), and whether al-Muyassar and al-Mukhtasar excerpts are enough as evidence or al-Sa'di should be added.
- Voyage receives translation and tafsir passages and our queries for embedding; confirm its data-use terms before Phase 1.
