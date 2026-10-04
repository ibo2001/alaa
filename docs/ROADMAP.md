# Roadmap: built vs planned

This file separates what was **built during the challenge** (Oct 4–6, 2026) from what is **planned**. It feeds the "Built during the challenge / Planned" slide.

## Built during the challenge
- Day 1: Next.js 15 PWA scaffold (App Router, TypeScript strict, Tailwind with RTL, `next-intl` ar/en, Serwist offline shell)
- Day 1: Tanzil loader with per-ayah SHA-256 manifest; Source Guard (4 level gates) with tests
- Day 1: `/api/see` vision endpoint: closed concept enum, thresholds, person/unsafe handling, per-device daily limit, swappable provider (`anthropic`, `stub`)
- Day 1: Lens (camera, gallery upload, sample photos), blessing card, "Is this…?" picker, abstention screen, source page, error states with next steps; Playwright tests

## Planned (not built yet)
- Source-bound RAG: retrieval over approved, licensed sources to help choose references and refine mappings for the religious reviewer (see `docs/SPEC.en.md` §16). Replaces interim choices such as the hand card
- "Report an error" filed through `/api/report` (today: link to a prefilled GitHub issue)
- Live camera preview with `getUserMedia` (today: the system camera via `capture="environment"`)
- Durable daily limit (shared store such as Vercel KV); today it is per server instance, best effort
- Second real vision provider behind `VISION_PROVIDER` (today: `stub` fallback)
- Norwegian locale, once a translation license is confirmed
- Native SwiftUI version with on-device Vision (lower cost, better privacy)
- `sanad-core` shared with Mizan: Source Guard, source registry, source-card component
