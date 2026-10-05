# Current state

A running snapshot of where the project is. Updated at each milestone. For "built vs planned" see `ROADMAP.md`; for content decisions see `DECISIONS.md`.

**Last updated:** 2026-10-05 10:46 (Riyadh) · **Live:** https://alaa-alpha.vercel.app

## Health
| Check | Status |
|---|---|
| Lint, typecheck | Clean |
| Unit tests (Vitest) | 64 passing |
| E2E (Playwright, stub provider) | 10 passing (builds into `.next-e2e`, so it can run beside `next dev`) |
| Vercel deploy | Green, auto-deploys from `main`. Day 2 work (review, app-style UI, new Home) pushed and live at 10:44 Riyadh; key pages 200, cached sample through `/api/see` gives the card |
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
| Review sheet for the reviewer: `/ar/review`, every card through the Guard; per card "fits" / "needs replacing" + suggested verse + notes, saved on the reviewer's device, sent to a private Google Form (`npx tsx scripts/review-form.ts fetch`); printable | Done |
| Religious review of the 25 cards, recorded in `sources/REVIEW_LOG.md` by Ibrahim | First round in (Ziyad, داعية): 12 cards + abstention `reviewed`; 4 Journey cards keep the Ar-Rahman verse and add his verse (draft); open questions sent to him on WhatsApp |
| User testing kit: protocol, printed sheets (Arabic and English PDF), results template, changes log | Done |
| Online forms (Google Forms, Arabic and English) with A/B links, blind-scoring script | Done: links in `docs/user-testing/forms.json` |
| User testing sessions | Not started (Ibrahim) |

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
- Video (≤ 2 min), presentation PDF, final checks from another device and network

## Open items
- `docs/alaa-pitch.pdf` (registration pitch, pre-challenge) is listed in `BASELINE.md` as "to be added"; Ibrahim adds the original file
- Challenge presentation: English draft approved and Arabic draft made (13 slides each, challenge work, separate from the registration pitch); files `docs/alaa-presentation.en.pdf` and `docs/alaa-presentation.ar.pdf`. Drafts: English https://claude.ai/artifact/CkdmBC1NQnwbfUtx3oxLpg, Arabic https://claude.ai/artifact/LR8yqaRmAPMncDxTTtobbx. Updated with Day 2 work on Oct 5 (both approved: idea line with the new Home, first review count on the Source Guard slide, new screen placeholders, built vs planned incl. voice input and Quran-first/hadith-fallback). Still placeholders: screenshots (after push, on a phone) and Day 3 results; exported to PDF on Day 3
- `DAILY_LIMIT` is not set on Vercel (defaults to 50 per device per instance); Ibrahim raises it at delivery, not before
- Push to `main` (deploys to Vercel) only when Ibrahim says so
- Daily limit is in memory per server instance (best effort); durable store is planned
- Only one real vision provider; the second is `stub`
- 13 of 25 mappings are `draft` (12 reviewed); no reflections are shown until reviewed
- Religious review: waiting for Ziyad's answers to the open questions listed at the end of `sources/REVIEW_LOG.md` (figs-olives, hand, eyes-tongue, Journey cards, 4 unreviewed cards, pomegranate/night-day/mountains). Apply only Ibrahim's decisions
- End-of-Day-1 progress reply to the committee: drafted in Ibrahim's Gmail (Arabic)

## Day 2 plan (Oct 5)
1. Religious review results → Ibrahim's decisions → `REVIEW_LOG.md` (first round done; second round waits for the reviewer)
2. User testing (A/B forms in `docs/user-testing/forms.json`; Ibrahim to check the prefilled links first), then `study-results.ts fetch`, blind scoring, `summarize`, `RESULTS.md`, `CHANGES_FROM_TESTING.md`
3. Fixes from review and testing; extend the eval set (needs labelled photos in `eval/images/`)
4. App-style UI, new Home, roadmap (voice input, Quran-first with hadith fallback) and presentation update (done); next: Ibrahim tries it on a phone, then fixes from that. The user-testing kit names no specific buttons or screens, so it still fits the new UI
5. Pushed and live (10:44); next: check the live site on a phone, then take the presentation screenshots

## Under consideration: Tafsir MCP (Tafsir Center for Quranic Studies, tafsir.net)
Open-source MCP server (code MIT, data CC BY 4.0 with attribution "Tafsir Center for Quranic Studies"): Uthmani text, word-level i'rab and roots, asbab al-nuzul, qira'at, 28 tafsir sources (incl. al-Muyassar, al-Sa'di, Ibn Kathir; English al-Mukhtasar). `claude mcp add tafsir --scope user -- uvx tafsir-mcp` (≈214 MB DB) or `https://mcp.tafsir.net/mcp`. Repo: https://github.com/tafsircenter/tafsir-mcp
- Proposed: development-time aid only (candidate verses by root for replacements; classical tafsir excerpts beside each mapping for the reviewer). Not a source of verse text (Tanzil stays the single Guard source)
- Possible feature (needs Ibrahim's decision on religious content and licence): one attributed al-Mukhtasar line per card as a build-time snapshot with LICENSE, gated by the Guard; otherwise `ROADMAP.md`
- Pending Ibrahim: (1) OK to install the MCP in Claude Code? (2) build the tafsir line now or roadmap it?
