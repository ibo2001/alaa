# Current state

A running snapshot of where the project is. Updated at each milestone. For "built vs planned" see `ROADMAP.md`; for content decisions see `DECISIONS.md`.

**Last updated:** 2026-10-04 12:45 (Riyadh) · **Live:** https://alaa-alpha.vercel.app

## Health
| Check | Status |
|---|---|
| Lint, typecheck | Clean |
| Unit tests (Vitest) | 55 passing |
| E2E (Playwright, stub provider) | 8 passing |
| Vercel deploy | Green, auto-deploys from `main` |
| Real-model eval (`claude-haiku-4-5`) | 21/21 correct, 7/7 consistent over 3 runs (7 sample photos) |

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
| Review sheet for the reviewer: `/ar/review`, every card through the Guard, printable, with a checklist | Done |
| Religious review of the 25 cards, recorded in `sources/REVIEW_LOG.md` by Ibrahim | Ready to start: send the reviewer https://alaa-alpha.vercel.app/ar/review |
| User testing kit: protocol, participant sheet (English and Arabic), results template, changes log | Done |
| User testing sessions | Not started (Ibrahim) |

## Day 3 (Oct 6): Measurement and submission (not started)
- Fixes from user testing; evaluation ×3, alternative-approach run, cost measurement
- `docs/METHODOLOGY.md`, `docs/RESULTS.md`
- Video (≤ 2 min), presentation PDF, final checks from another device and network

## Open items
- `docs/alaa-pitch.pdf` (registration pitch, pre-challenge) is listed in `BASELINE.md` as "to be added"; Ibrahim adds the original file
- Challenge presentation: English draft approved and Arabic draft made (13 slides each, challenge work, separate from the registration pitch); files `docs/alaa-presentation.en.pdf` and `docs/alaa-presentation.ar.pdf`. Placeholders for screenshots, Day 2–3 features and Day 3 results; exported to PDF on Day 3
- `DAILY_LIMIT` is not set on Vercel (defaults to 50 per device per instance); raise it for the judging period
- Daily limit is in memory per server instance (best effort); durable store is planned
- Only one real vision provider; the second is `stub`
- All 25 mappings are `draft`; no reflections are shown until reviewed
