# Current state

A running snapshot of where the project is. Updated at each milestone. For "built vs planned" see `ROADMAP.md`; for content decisions see `DECISIONS.md`.

**Last updated:** 2026-10-06 11:30 (Riyadh) · **Live:** https://alaa-alpha.vercel.app

## Health
| Check | Status |
|---|---|
| Lint, typecheck | Clean |
| Unit tests (Vitest) | 141 passing (60 of them for `rag/`) |
| E2E (Playwright, stub provider) | 10 passing (builds into `.next-e2e`, so it can run beside `next dev`) |
| Vercel deploy | Green, auto-deploys from `main`. Everything up to 16:43 Riyadh is pushed and live (app-style UI, new Home, Rowwad translation, reviewed hand and eyes-tongue cards, no-verse rule fix; later pushes are docs and offline `rag/` tooling only, the app is unchanged) |
| RAG retrieval eval (offline tooling) | 22 known pairs: reviewer's verse among 8 candidates for 16 (73%), MRR 0.49, $0.0055 per question; roots + keywords only (no Voyage key yet) |
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

## Day 3 (Oct 6): Measurement and submission (in progress)
| Item | Status |
|---|---|
| User-test responses | 0 in both forms (checked every 30 min since 09:16). Ibrahim runs in-person sessions until 15:00; then blind scoring and `docs/user-testing/RESULTS.md`, or an honest "0 responses" |
| Reviewer's voice notes (3, transcribed locally) | Applied by Ibrahim's decision: 4 Journey cards + dates-palms, speech-writing, sleep reviewed (21 of 25); refrain approved (log only); hadith suggestion → roadmap. figs-olives, pomegranate, night-day, mountains stay draft |
| MIT license for the code; pitch PDF marked present in `BASELINE.md` | Done |
| Accessibility and usability audit (axe 112 states, Lighthouse, keyboard, 200% text) and fixes | Done, live: two-tone focus ring, scroll padding for the bars, sheet focus, contrast, 200% text, favicon, judge hints. axe 0 violations after. Recorded as an audit (not user testing) in `CHANGES_FROM_TESTING.md` and `RESULTS.md` |
| My Day share card redesign | Done, live: whole Guard-verified verses (reviewed mappings only, never cut, tested layout), line icons (Lucide), Hijri date, QR invite (`qrcode`). Video left unchanged by Ibrahim's choice |
| Decks | Both: "How Alaa meets the judging criteria" slide (official criterion names, Arabic and English), 21 of 25 on the Source Guard slide, share card on the phones slide. Still to do: user-test results, PDF export, Ibrahim's review of the English deck |
| Submission on the platform | Ibrahim, target 19:30–21:00 |

## Open items
- `docs/alaa-pitch.pdf` (registration pitch, pre-challenge) is listed in `BASELINE.md` as "to be added"; Ibrahim adds the original file
- Challenge presentation: rebuilt in the official challenge template (PPTX, 16 slides, their identity and layouts; adds a team slide, a "meets the reference framework" slide and a built/planned timeline; real screenshots of the live app). Arabic approved by Ibrahim (reviewed in Google Slides: https://docs.google.com/presentation/d/1YdfoLD8rtyEsIb6IhYH-XcIB4_ob-PNg-f9iHPTDT6g/edit); English built the same way, waiting for his review. Files in `docs/presentation/` (git-ignored: partner logos, 10 MB each). Oct 5 11:45: both decks updated for the Rowwad translation (English screenshots re-taken from the live site, timeline now lists the approved translation under Day 2). 14:05: both decks updated with the evaluation (88%, 97%, 1.7 s, $0.004 per photo; alternative in a footnote) and the review count (13 of 25 + abstention). Day 3: add user-test results. Earlier Slides-artifact drafts are superseded
- `DAILY_LIMIT` is not set on Vercel (defaults to 50 per device per instance); Ibrahim raises it at delivery, not before
- Push to `main` (deploys to Vercel) only when Ibrahim says so
- English translation switched to Rowwad Translation Center (QuranEnc.com v1.0.19-xml.1), file unchanged, footnotes shown, all 25 cards; Itani stays registered but unused
- Daily limit is in memory per server instance (best effort); durable store is planned
- Only one real vision provider; the second is `stub`
- 4 of 25 mappings are `draft` (21 reviewed); no reflections are shown until reviewed
- Religious review: waiting for Ziyad's answers to the open questions listed at the end of `sources/REVIEW_LOG.md` (figs-olives, Journey cards, 4 unreviewed cards, pomegranate/night-day/mountains; hand and eyes-tongue answered by voice note on Oct 5, transcribed locally with whisper-cpp). Apply only Ibrahim's decisions
- End-of-Day-1 progress reply to the committee: drafted in Ibrahim's Gmail (Arabic)

## Day 2 plan (Oct 5): status at 16:46
1. Religious review: first round recorded; voice-note answers applied (hand, eyes-tongue); waiting for the rest of Ziyad's answers
2. User testing: links sent; when responses arrive, `npx tsx scripts/study-results.ts fetch`, blind scoring, `summarize`, `docs/user-testing/RESULTS.md`, `docs/CHANGES_FROM_TESTING.md`
3. Evaluation: done (34 photos × 3 runs, two runs reported in `docs/RESULTS.md`; rule fix from run 1)
4. App-style UI, new Home, roadmap, approved translation, decks in the official template (Arabic and English approved): done. Team name corrected in both decks at 17:50 (cover, Team slide, thank-you slide): the team is «عباد الرحمن» / "Ibad Ar-Rahman" (team 181); «آلاء» / Alaa is the app. PDFs re-exported; the Google Slides copy of the Arabic deck still has the old name until Ibrahim re-uploads it
5. RAG reviewer's assistant: spec (`docs/superpowers/specs/2026-10-05-rag-reviewer-assistant-design.md`) approved by Ibrahim; Phase 0 (Tafsir database + LICENSE) and Phase 1 done on Oct 5. Still open: Voyage key (meaning channel, optional; read its data-use terms first) and Phase 2 (reviewer candidates page, form sending, `answers.ts`)
   - Phase 1 plan: `docs/superpowers/plans/2026-10-05-rag-phase-1.md`. Tasks 1–7 built and merged (Oct 5, 16:30): `rag/` tooling (Arabic normalisation, Tafsir database access with hash pinning, passage table, index with source and data-file hashes, roots + BM25 + Voyage channels with reciprocal-rank fusion, Claude re-ranker limited to an enum of candidate keys, references-only packets checked by the Source Guard, `propose` CLI); 56 offline tests; final review by a fresh reviewer, its two important findings fixed. Tasks 8–9 done 16:45: Ibrahim added the Tafsir Center database v1.0 (hash matches the upstream pin) and its LICENSE; index built (roots + keywords); first packets in `rag/packets/` (water, hand, warm shower); evaluation 16/22 (73%) recall@8, MRR 0.49, $0.0055 per question (`docs/RESULTS.md`); threshold kept at 0.5 (`docs/DECISIONS.md`). Next: a Voyage key for the meaning channel, then Phase 2 (reviewer page)
6. Demo video: done. Final cuts rendered (1:57; vertical 1080×1920 and landscape 1920×1080) in `video/out/` (git-ignored): scripted 3× screen recordings of the live app (`video/record.ts`), Remotion composition in the app's look (`video/src/`), Arabic voice-over by ElevenLabs (voice "Rawi", disclosed on the end card), English captions, Pexels glass clip as the opening. Pexels link recorded in `SOURCES.md`. Landscape cut on YouTube (unlisted): https://youtu.be/preYsrkPt60
7. Next while waiting: Ibrahim checks the live site on a phone; user-test responses (background check every 15 min until 21:45; still 0 at 22:00 on Oct 5 and 0 at 09:02 on Oct 6 in both forms, raw counts included; both forms published and accepting). First thing on Day 3: fetch again, then blind scoring and `docs/user-testing/RESULTS.md` if any arrived and Ziyad's remaining answers
9. Mentors' channel on Discord (`#عباد-الرحمن-181`): Nasser Almani (mentor) reminded at 14:16 that the final submission is due Oct 6 at 23:59 and asked for status; Ibrahim posted the study links at 17:36 asking mentors to try and share them; Ibrahim then posted a Day 2 progress reply (with the video link). Shroog Alshamrani answered at 17:53: the challenge does not provide religious reviewers; religious review happens during judging, so the request for a second reviewer is closed. At 18:01 she asked every team for an end-of-Day-2 update (5 questions, due before 19:00); Ibrahim posted the answers. The Day 2 check-out (✅ or one line) is expected around 22:00, as on Day 1
8. Afternoon (15:30–): prompt caching measured: not in effect (prefix ≈3k tokens, below Haiku 4.5's 4,096 minimum; padding would cost more at demo traffic), written up in `docs/RESULTS.md`, no code change. README, roadmap and `.env.example` brought in line with what is built. Cold run of the live site (laptop and phone size, ar and en, 14 pages, all 7 sample photos): no errors, no broken requests, no horizontal scroll, results under 2 s. Both decks exported to PDF next to the PPTX files (git-ignored, 16 pages, fonts embedded). User-test responses: 0 at 15:40

## Tafsir MCP (Tafsir Center for Quranic Studies, tafsir.net): source of the RAG tooling
Its SQLite database `sources/tafsir/quran.db` (v1.0, commit dbbfa77, 234 MB, git-ignored; SHA-256 pinned in `sources/tafsir/manifest.json` and equal to the upstream pin; data CC BY 4.0, attribution "Tafsir Center for Quranic Studies (https://tafsir.net)"; code MIT) is the tafsir and Arabic-roots source of the RAG reviewer's assistant (see the spec). Tafsir is shown only to the reviewer, never in the app; Tanzil stays the only verse text users see. The hosted MCP (`https://mcp.tafsir.net/mcp`) can serve as a manual research aid. Showing a tafsir line to users remains a separate decision (roadmap).
