# Alaa · آلاء

**A lens for seeing blessings.** Point your camera at something everyday (water, a date, the sky, your hand). A vision model recognizes it from a closed list of concepts, and Alaa shows where the Quran mentions it, verbatim from the Tanzil text, with a link to verify on quran.com.

Built for the AI Challenge for Islamic Content (islamicaich.org), Track 3: Interactive Experiences & Knowledge Journeys, Oct 4–6, 2026. See `BASELINE.md` for what existed before the challenge.

> Alaa is not a mushaf app, a tafsir, a fatwa service or a religious Q&A. The AI only **sees**; it never writes religious text.

## Status
Work in progress during the challenge. See `docs/ROADMAP.md`.

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

## Environment variables
See `.env.example`.

| Name | Purpose |
|---|---|
| `VISION_PROVIDER` | `anthropic` (default) or `stub` |
| `VISION_MODEL` | Model id for the Anthropic provider |
| `ANTHROPIC_API_KEY` | Server-side only |
| `DAILY_LIMIT` | Recognitions per device per day |
| `GITHUB_ISSUES_TOKEN`, `GITHUB_REPO` | "Report an error" → GitHub Issues |

## Documentation
- `docs/SPEC.md` (Arabic, reference for religious content) · `docs/SPEC.en.md` (reference for code)
- `docs/SOURCES.md`: sources, tools and licenses
- `docs/ROADMAP.md`: built vs planned
