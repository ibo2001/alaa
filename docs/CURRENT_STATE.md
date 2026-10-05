# Current state

A running snapshot of where the project is. Updated at each milestone. For "built vs planned" see `ROADMAP.md`; for content decisions see `DECISIONS.md`.

**Last updated:** 2026-10-05 16:35 (Riyadh) · **Live:** https://alaa-alpha.vercel.app

## Health
| Check | Status |
|---|---|
| Lint, typecheck | Clean |
| Unit tests (Vitest) | 130 passing (56 of them for `rag/`) |
| E2E (Playwright, stub provider) | 10 passing (builds into `.next-e2e`, so it can run beside `next dev`) |
| Vercel deploy | Green, auto-deploys from `main`. Everything up to 14:16 Riyadh is live (app-style UI, new Home, Rowwad translation, reviewed hand and eyes-tongue cards, no-verse rule fix) |
| Real-model eval (`claude-haiku-4-5`) | 34 photos × 3 runs: 88% correct or correctly abstained after the no-verse rule fix (79% before), 97% consistent, 1.7 s median, $0.0041 per photo; alternative approach 88%, $0.0020 (`docs/RESULTS.md`) |

## Day 1 (Oct 4): The Lens
| Item | Status |
|---|---|
| Scaffold: Next.js 15, TypeScript strict, Tailwind RTL, `next-intl` ar/en, Serwist offline shell | Done |
| Vercel deploy | Done |
| Tanzil text + Itani translation, SHA-256 manifest, Source Guard (4 levels) with tests | Done |
| Concepts (122) and blessings (25 references, all `draft`), empty `REVIEW_LOG.md` | Done |
| `/api/see`: closed enum, thresholds, person/unsafe handling, daily limit, swappable provider | Done |
| Lens: camera, gallery, 7 sample photos with cached results, "Is this…?", abstention (14:34 and 16:18 as whole cards), errors | Done |
| Blessing card and source page (quran.com links, licence, review status, report link) | Done |
| Content decisions recorded (`DECISIONS.md`), source-bound RAG planned (SPEC §16) | Done |
| Eval on 30 images (SPEC §12) | Partial: 7 photos × 3 runs. Needs more labelled photos from Ibrahim in `eval/images/` |
| Placeholder submission on the challenge platform | Ibrahim (outside the repo) |

## Day 2: Journey and testing (started early, Oct 4)
| Item | Status |
|---|---|
| Learning stage on welcome, stored on device; "new" readers get the refrain note (31 repeats, counted from Tanzil hashes) | Done |
| My Day's Surah: today's blessings, each followed by the refrain; counter; remove | Done |
| 1080×1920 share card drawn on device (names and references only, refrain whole); share or download | Done |
| Ar-Rahman Journey: 7 stations with missions, found by photo or card read, progress on device, reset | Done |
| After-journey screen: read the surah on quran.com, daily habit | Done |
| After-journey referral to human support | Done: IslamQA (Ibrahim's choice) |
| About page (what Alaa is and is not, AI use, sources, review, privacy, referral, report) | Done |
| Review sheet for the reviewer: `/ar/review`, every card through the Guard; per card "fits" / "needs replacing" + suggested verse + notes, saved on the reviewer's device, sent to a private Google Form (`npx tsx scripts/review-form.ts fetch`); printable | Done |
| Religious review of the 25 cards, recorded in `sources/REVIEW_LOG.md` by Ibrahim | First round in (Ziyad, داعية): 12 cards + abstention `reviewed`; Oct 5: hand → An-Nahl 16:53 and eyes-tongue → 67:23 + 30:22, reviewed (14 cards); 4 Journey cards keep the Ar-Rahman verse and add his verse (draft); open questions sent to him on WhatsApp |
| User testing kit: protocol, printed sheets (Arabic and English PDF), results template, changes log | Done |
| Online forms (Google Forms, Arabic and English) with A/B links, blind-scoring script | Done: links in `docs/user-testing/forms.json` |
| User testing sessions | Started Oct 5 afternoon: Ibrahim sent the A/B group links (a first general link without the group was replaced); no responses yet at 14:20 |

## Day 2 (Oct 5): App-style UI
The PWA now looks and behaves like a native app instead of a website. Checked at phone width in Arabic and English.

| Item | Status |
|---|---|
| App shell: bottom tab bar (Home, Journey, Look raised in the middle, My Day, About) replaces the website header | Done |
| Compact translucent top bar: back on pushed pages (in-app history, parent page for shared links), app name, language chip | Done |
| Page transitions: slide in when going deeper, slide back on return, crossfade between tabs; opacity only with reduced motion, solid bars with reduced transparency | Done |
| Native touches: safe-area insets, press feedback, no tap delay, no page bounce | Done |
| Home: date (Gregorian and Hijri), "Blessings beyond counting" (نِعَمٌ لا تُحصى): a verse chosen on the device by time of day from Guard-verified references already in `blessings.json` (see `DECISIONS.md`), the refrain, "another verse", day and journey status tiles; intro and learning stage only until answered (stage also in About). No repeated shortcuts | Done |
| Lens: viewfinder panel with shutter and gallery buttons, scan line while analysing; confirm, abstention and error as bottom sheets on `<dialog>` | Done |
| Card: icon action row (Add to My Day, Share, Source, quran.com); verses from different surahs shown as separate passages | Done |
| My Day: empty state, round remove buttons, share-card tools in a card | Done |
| Journey: progress card and a timeline joining the 7 stations | Done |
| About and Source: grouped inset cards and rows | Done |
| Abstention counter in Arabic digits | Done |
| Review sheet (`/review`) | Unchanged on purpose (printable reviewer tool) |
| Try on a real phone (touch feel of the shutter, sheets, transitions) | Ibrahim |

## Day 3 (Oct 6): Measurement and submission (not started)
- Fixes from user testing; evaluation ×3, alternative-approach run, cost measurement
- `docs/METHODOLOGY.md`, `docs/RESULTS.md`
- Video (≤ 2 min): final cuts ready (1:57); upload unlisted and put the link in the submission; re-render with `cd video && npm run render:landscape` if screens or numbers change. Presentation: decks ready in the official template (export PDF). Final checks from another device and network

## Open items
- `docs/alaa-pitch.pdf` (registration pitch, pre-challenge) is listed in `BASELINE.md` as "to be added"; Ibrahim adds the original file
- Challenge presentation: rebuilt in the official challenge template (PPTX, 16 slides, their identity and layouts; adds a team slide, a "meets the reference framework" slide and a built/planned timeline; real screenshots of the live app). Arabic approved by Ibrahim (reviewed in Google Slides: https://docs.google.com/presentation/d/1YdfoLD8rtyEsIb6IhYH-XcIB4_ob-PNg-f9iHPTDT6g/edit); English built the same way, waiting for his review. Files in `docs/presentation/` (git-ignored: partner logos, 10 MB each). Oct 5 11:45: both decks updated for the Rowwad translation (English screenshots re-taken from the live site, timeline now lists the approved translation under Day 2). 14:05: both decks updated with the evaluation (88%, 97%, 1.7 s, $0.004 per photo; alternative in a footnote) and the review count (13 of 25 + abstention). Day 3: add user-test results. Earlier Slides-artifact drafts are superseded
- `DAILY_LIMIT` is not set on Vercel (defaults to 50 per device per instance); Ibrahim raises it at delivery, not before
- Push to `main` (deploys to Vercel) only when Ibrahim says so
- English translation switched to Rowwad Translation Center (QuranEnc.com v1.0.19-xml.1), file unchanged, footnotes shown, all 25 cards; Itani stays registered but unused
- Daily limit is in memory per server instance (best effort); durable store is planned
- Only one real vision provider; the second is `stub`
- 11 of 25 mappings are `draft` (14 reviewed, incl. hand → 16:53, eyes-tongue → 67:23 + 30:22); no reflections are shown until reviewed
- Religious review: waiting for Ziyad's answers to the open questions listed at the end of `sources/REVIEW_LOG.md` (figs-olives, Journey cards, 4 unreviewed cards, pomegranate/night-day/mountains; hand and eyes-tongue answered by voice note on Oct 5, transcribed locally with whisper-cpp). Apply only Ibrahim's decisions
- End-of-Day-1 progress reply to the committee: drafted in Ibrahim's Gmail (Arabic)

## Day 2 plan (Oct 5): status at 14:20
1. Religious review: first round recorded; voice-note answers applied (hand, eyes-tongue); waiting for the rest of Ziyad's answers
2. User testing: links sent; when responses arrive, `npx tsx scripts/study-results.ts fetch`, blind scoring, `summarize`, `docs/user-testing/RESULTS.md`, `docs/CHANGES_FROM_TESTING.md`
3. Evaluation: done (34 photos × 3 runs, two runs reported in `docs/RESULTS.md`; rule fix from run 1)
4. App-style UI, new Home, roadmap, approved translation, decks in the official template (Arabic and English approved): done
5. RAG design: spec written and committed (`docs/superpowers/specs/2026-10-05-rag-reviewer-assistant-design.md`), approved section by section, awaiting Ibrahim's review of the document. Phase 0 needs from him: the Tafsir Center database + LICENSE in `sources/tafsir/`, a Voyage API key. Built only if Day 3 leaves time; otherwise it is the deck's "planned" item
   - Phase 1 plan: `docs/superpowers/plans/2026-10-05-rag-phase-1.md`. Tasks 1–7 built and merged (Oct 5, 16:30): `rag/` tooling (Arabic normalisation, Tafsir database access with hash pinning, passage table, index with source and data-file hashes, roots + BM25 + Voyage channels with reciprocal-rank fusion, Claude re-ranker limited to an enum of candidate keys, references-only packets checked by the Source Guard, `propose` CLI); 56 offline tests; final review by a fresh reviewer, its two important findings fixed. Tasks 8–9 (first real build, retrieval evaluation, score threshold) wait for Phase 0: `sources/tafsir/quran.db` + LICENSE from Ibrahim; Voyage key optional
6. Demo video: done. Final cuts rendered (1:57; vertical 1080×1920 and landscape 1920×1080) in `video/out/` (git-ignored): scripted 3× screen recordings of the live app (`video/record.ts`), Remotion composition in the app's look (`video/src/`), Arabic voice-over by ElevenLabs (voice "Rawi", disclosed on the end card), English captions, Pexels glass clip as the opening. Pexels link recorded in `SOURCES.md`. Landscape cut on YouTube (unlisted): https://youtu.be/preYsrkPt60
7. Next while waiting: Ibrahim checks the live site on a phone; user-test responses and Ziyad's remaining answers
8. Afternoon (15:30–): prompt caching measured: not in effect (prefix ≈3k tokens, below Haiku 4.5's 4,096 minimum; padding would cost more at demo traffic), written up in `docs/RESULTS.md`, no code change. README, roadmap and `.env.example` brought in line with what is built. Cold run of the live site (laptop and phone size, ar and en, 14 pages, all 7 sample photos): no errors, no broken requests, no horizontal scroll, results under 2 s. Both decks exported to PDF next to the PPTX files (git-ignored, 16 pages, fonts embedded). User-test responses: 0 at 15:40

## Tafsir MCP (Tafsir Center for Quranic Studies, tafsir.net): now part of the RAG design
Its SQLite database (data CC BY 4.0, attribution "Tafsir Center for Quranic Studies"; code MIT; ≈214 MB, git-ignored and hash-pinned) is the tafsir and Arabic-roots source of the RAG reviewer's assistant (see the spec). Tafsir is shown only to the reviewer, never in the app; Tanzil stays the only verse text users see. The hosted MCP (`https://mcp.tafsir.net/mcp`) can serve as a manual research aid. Showing a tafsir line to users remains a separate decision (roadmap).
