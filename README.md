# Alaa · آلاء

**A lens for seeing blessings.** Point your camera at something everyday (water, a date, the sky, your hand). A vision model recognizes it from a closed list of concepts, and Alaa shows where the Quran mentions it, verbatim from the Tanzil text, with a link to verify on quran.com.

Built for the AI Challenge for Islamic Content (islamicaich.org), Track 3: Interactive Experiences & Knowledge Journeys, Oct 4–6, 2026. See `BASELINE.md` for what existed before the challenge.

**Live demo:** https://alaa-alpha.vercel.app (Arabic: `/ar`, English: `/en`). No camera? Use the sample photos in the lens.

> Alaa is not a mushaf app, a tafsir, a fatwa service or a religious Q&A. The AI only **sees**; it never writes religious text.

## How it works
1. **Lens** (`/[locale]/lens`): take a photo, upload one, or pick a sample photo. Photos are shrunk to 768px on the device.
2. **`/api/see`** sends the photo to a vision model that may only answer with concept ids from a closed list (`sources/concepts.json`) plus a confidence. Thresholds: ≥ 0.75 card · 0.45–0.75 "Is this…?" · < 0.45 polite abstention. Images are never stored or logged.
3. **Blessing card**: the concept maps to verse references in `sources/blessings.json`. Verse text is loaded from the Tanzil file and must pass the **Source Guard**:
   - L1: every ayah must match its SHA-256 in `sources/quran/manifest.json`, otherwise nothing is shown
   - L2: a translation is shown only with its text and LICENSE present (else Arabic only). English: Rowwad Translation Center via QuranEnc (`sources/translations/en.rwwad/`), shown with its footnotes exactly as published
   - L3: unreviewed mappings show a "mapping under review" badge
   - L4: reflections are hidden until reviewed (see `sources/REVIEW_LOG.md`)
4. **Source page**: text source, translation and license, review status, quran.com link.
5. **My Day's Surah** (`/[locale]/today`): blessings added from cards, each followed by the refrain; a 1080×1920 share card is drawn on the device with Canvas (blessing names and references, the refrain whole).
6. **Ar-Rahman Journey** (`/[locale]/journey`): 7 stations in the surah's order, each found by photo or by reading its card, then the after-journey steps.

The learning stage, My Day and journey progress are stored on the device (IndexedDB) only. There are no accounts.

See `docs/ROADMAP.md` for what is built and what is planned.

## Setup
Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000 (redirects to /ar)
```

## Scripts
| Script | What it does |
|---|---|
| `npm run dev` | Development server (service worker disabled) |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit tests (Source Guard, logic) |
| `npm run test:e2e` | Playwright end-to-end tests (builds and starts the app) |

## Data and evaluation
```bash
npx tsx scripts/build-manifest.ts           # regenerate SHA-256 manifests (source files are never modified)
npx tsx eval/quick.ts eval/images           # run a folder of photos through a running app (/api/see)
npx tsx eval/quick.ts --record              # record real model results for public/samples/ (instant demo)
npx tsx eval/run.ts --runs=3                # full evaluation: Alaa's closed-list call vs free labels + mapping
```

Latest full evaluation (34 labelled photos × 3 runs, `claude-haiku-4-5`): 88% correct or correctly abstained, 97% consistent, 1.7 s median, $0.0041 per photo. Method in `docs/METHODOLOGY.md`, numbers and the honest first run in `docs/RESULTS.md`.

## Environment variables
See `.env.example`.

| Name | Purpose |
|---|---|
| `VISION_PROVIDER` | `anthropic` (default) or `stub` (offline; returns the labeled concept for sample photos only) |
| `VISION_MODEL` | Model id for the Anthropic provider (default `claude-opus-5-5`; the live demo and the evaluation use `claude-haiku-4-5-20251001`) |
| `ANTHROPIC_API_KEY` | Server-side only |
| `DAILY_LIMIT` | Recognitions per device per day (default 50; sample photos with cached results don't count) |
| `GITHUB_ISSUES_TOKEN`, `GITHUB_REPO` | Reserved for the planned `/api/report`; not read today ("Report an error" opens a prefilled GitHub issue) |

## Documentation
- `docs/SPEC.md` (Arabic, reference for religious content) · `docs/SPEC.en.md` (reference for code)
- `docs/SOURCES.md`: sources, tools and licenses
- `docs/ROADMAP.md`: built vs planned
- `docs/METHODOLOGY.md` · `docs/RESULTS.md`: how Alaa is measured, and the results
- `docs/DECISIONS.md`: decisions and why · `sources/REVIEW_LOG.md`: religious review, card by card
- `docs/user-testing/`: user-testing protocol, sheets and forms
- `docs/video/`: demo video script; the video is composed with Remotion in `video/` (`cd video && npm install && npm run render`; clips from `npx tsx video/record.ts`)
- `docs/superpowers/specs/2026-10-05-rag-reviewer-assistant-design.md`: design of the planned source-bound RAG reviewer's assistant
