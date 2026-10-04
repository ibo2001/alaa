# CLAUDE.md — Alaa (آلاء)

Standing instructions for Claude Code in this repository. Read this file and `docs/SPEC.en.md` before doing anything.

## What we are building
**Alaa** is a PWA: the user points the camera at an everyday object (water, a date, the sky, a hand), a vision model recognizes it from a **closed list of concepts**, and the app shows where the Quran mentions it, verbatim from a verified source, then the refrain ﴿فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ﴾. Blessings collected during the day form "My Day's Surah" (a shareable card). "Ar-Rahman Journey" is a 7-station path following the surah's order.

It is built for the **AI Challenge for Islamic Content** (islamicaich.org), Track 3: Interactive Experiences & Knowledge Journeys. Challenge days: Oct 4–6, 2026.

**Alaa is not** a mushaf app, a tafsir, a fatwa service or a religious Q&A. It is technology that helps people notice blessings they take for granted.

- `docs/SPEC.en.md` is the reference for code (architecture, data model, repo layout, plan).
- `docs/SPEC.md` (Arabic) is the reference for religious content. If they diverge on religious content, the Arabic wins.
- `BASELINE.md` documents what existed before the challenge.

## Who the users are
| Audience | What matters to them | Design consequence |
|---|---|---|
| Curious non-Muslims | Calm, non-preachy entry point, in English | Start from the object, not from doctrine. Respectful, warm tone. Never preach |
| New Muslims | Connecting the Quran to daily life | Simple language, short daily habit ("My Day's Surah") |
| Muslims in general | Renewed attention to blessings | Beautiful, shareable cards |
| People who introduce Islam | A conversation-starter tool | Works fast, offline-friendly, looks good on a phone held up to someone |
| **Judges** (the demo audience) | Try every feature in minutes, often on a laptop with no camera; verify claims | Sample photos in the lens, quran.com verification links, clear errors, nothing broken |

The learning stage ("I'm new to the Quran" / "I know the Quran") is chosen by the user and stored on the device. **Never ask about, infer or store religion or any sensitive attribute.**

The developer is Ibrahim, a senior iOS/Swift developer who also knows the MERN stack. Explain Next.js-specific choices briefly when they are not obvious. Talk to him in Arabic if he writes in Arabic; all code, comments, commit messages and repo docs are in English.

## Non-negotiable rules for religious content
The AI **sees**. It never **speaks about religion**.

1. **Never type, generate, paraphrase or "fix" Quran text or hadith text from memory.** Not in code, fixtures, tests, comments, seed data or UI copy. Verse text comes only from the Tanzil file in `sources/quran/`, loaded at runtime/build time by reference (surah, ayah).
2. Seed data (`sources/blessings.json`) holds **references only** (surah/ayah numbers), taken from `docs/SPEC.md` §9. If a reference looks wrong, flag it to Ibrahim; do not change it on your own.
3. The vision model returns **only** concept IDs from the closed enum plus confidence. It never selects verses, never writes religious text, never describes people.
4. Source Guard gates (implement exactly, with tests):
   - Level 1 (hard): verse text must hash-match the Tanzil file, otherwise the card does not render.
   - Level 2: a translation renders only if `sources/translations/<lang>/` has the text **and** a LICENSE file. Otherwise show Arabic only with "translation pending".
   - Level 3: `review.mapping !== "reviewed"` → show a "mapping under review" badge.
   - Level 4: `review.reflection !== "reviewed"` → reflection is not rendered at all.
5. Never mark anything as reviewed. Only Ibrahim changes review status, with an entry in `sources/REVIEW_LOG.md`.
6. Abstention text (Ibrahim 14:34) is also loaded from Tanzil by reference.
7. No "scientific miracle" claims anywhere in copy.
8. Any religious question from a user → referral link to a recognized organization, never an answer.
9. Do not download Quran text, translations or images from the internet yourself. Ibrahim adds them with their licenses. If something is missing, stop and tell him exactly which file is needed and where.

## Tech stack
- Next.js 15 (App Router) + TypeScript (strict), deployed on Vercel
- Tailwind CSS with full RTL (`dir="rtl"` for `ar`, logical properties `ms-/me-/ps-/pe-`)
- `next-intl` with locales `ar` (default) and `en` only
- Serwist (`@serwist/next`) for the PWA
- Fonts via `next/font/google`: Aref Ruqaa (headings), Amiri Quran (verses only), IBM Plex Sans Arabic (UI)
- Vision: `/api/see` → `VisionProvider` interface; default provider uses the Anthropic SDK with a forced tool call whose input schema has an `enum` of concept IDs. Model from env `VISION_MODEL`. A second provider is selectable via env `VISION_PROVIDER` without code changes
- IndexedDB via `idb-keyval` for "My Day" and the learning stage
- Canvas API for the 1080×1920 share card
- Vitest (Guard, logic) + Playwright (main flow)

## Design tokens (until the Design System from Claude Design arrives)
| Token | Hex | Use |
|---|---|---|
| `layl` (night) | `#1B2340` | Primary dark background, text on light |
| `lazima` (gold) | `#E6C478` | The refrain, highlights. Check contrast on `layl` |
| `sama` (sky) | `#E4ECF3` | Light background |
| `nakhl` (palm) | `#2F6B4F` | Success, journey progress |
| `tamr` (date) | `#7A3B1D` | Accents, warm details |

Define these as CSS variables and Tailwind theme colors so a later Design System can replace values without touching components.

## Privacy
Images are downscaled on-device (max edge 768px), sent to `/api/see`, analyzed and discarded. Never store or log images or model inputs. No accounts, no tracking beyond anonymous page analytics. If the model reports `is_person: true`, offer only "eye"/"hand" if clearly visible and never infer attributes.

## Challenge rules that affect how you work
- **Only work done Oct 4–6 counts.** Working hours (Riyadh time = Qatar time): Oct 4–5, 09:00–22:00; Oct 6, 09:00–23:59. Commit only within these hours.
- Commit small and often with clear messages (`feat:`, `fix:`, `test:`, `docs:`). The git history is evidence for the judges.
- The repo will be **public**. Never commit secrets. Keys live in `.env.local` (git-ignored); keep `.env.example` current with names only.
- Every dependency, font, image, dataset and translation gets a line in `docs/SOURCES.md` (name, source, license). AI tools used in development (Claude Code) are listed there too.
- The live demo must work for judges until Oct 22: sample photos in `public/samples/`, cached results for them, a raised daily limit for the demo, clear error messages with a next step.

## Working style
- Before a multi-step task, write a short plan (max ~10 lines) and start; do not wait for approval unless a decision touches religious content, licensing, cost or anything irreversible.
- Run `npm run lint`, `npm run typecheck` and `npm test` before every commit.
- Prefer boring, well-supported solutions over clever ones. A complete, stable feature beats two half-done ones.
- Keep accessibility in mind from the start: alt text, accessible button names, text scaling, focus states, contrast.
- When something is planned but not built, record it in `docs/ROADMAP.md` so the presentation can separate "built during the challenge" from "planned".
