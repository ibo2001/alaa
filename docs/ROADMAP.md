# Roadmap: built vs planned

This file separates what was **built during the challenge** (Oct 4–6, 2026) from what is **planned**. It feeds the "Built during the challenge / Planned" slide.

## Built during the challenge
- Day 1: Next.js 15 PWA scaffold (App Router, TypeScript strict, Tailwind with RTL, `next-intl` ar/en, Serwist offline shell)
- Day 1: Tanzil loader with per-ayah SHA-256 manifest; Source Guard (4 level gates) with tests
- Day 1: `/api/see` vision endpoint: closed concept enum, thresholds, person/unsafe handling, per-device daily limit, swappable provider (`anthropic`, `stub`)
- Day 1: Lens (camera, gallery upload, sample photos), blessing card, "Is this…?" picker, abstention screen, source page, error states with next steps; Playwright tests
- Day 2 (started Oct 4): learning stage on the welcome screen (on device, optional); My Day's Surah with the refrain after each blessing and a 1080×1920 share card drawn on the device; Ar-Rahman Journey with 7 stations (found by photo or card read), progress on the device and the after-journey screen with a referral to IslamQA for religious questions; About page; printable review sheet for the religious reviewer; user testing protocol
- Day 2 (Oct 5): first religious review recorded (12 cards and the abstention reviewed; Journey cards keep their Ar-Rahman verse and add the reviewer's suggestion); app-style UI (tab bar, compact top bar, page transitions, lens viewfinder with bottom sheets, card action row, journey timeline); new Home with "نِعَمٌ لا تُحصى / Blessings beyond counting" (a Guard-verified verse by time of day, Hijri date, day and journey status)
- Day 2 (Oct 5): reviewer's voice-note answers applied (hand → An-Nahl 16:53, eyes-tongue → Al-Mulk 67:23 and Ar-Rum 30:22), 14 of 25 mappings reviewed; English translation switched to the challenge-approved Rowwad translation from QuranEnc, with footnotes inside the Guard's hash; full recognition evaluation (34 labelled photos × 3 runs, Alaa vs free labels + mapping; first run 79%, fix to the no-verse rule, second run 88%) with `docs/METHODOLOGY.md` and `docs/RESULTS.md`; prompt-caching measurement (not applicable at the current prompt size); user-testing online forms with A/B groups; design of the RAG reviewer's assistant and its Phase 1 tooling in `rag/` (retrieval over the Tafsir Center database, keys-only re-ranking, references-only candidate packets; first evaluation: the reviewer's verse among the 8 candidates for 16 of 22 known pairs); demo video (scripted screen recordings, Remotion composition, Arabic AI voice-over with English captions)
- Day 3 (Oct 6): reviewer's second voice-note round applied: the 4 Journey cards (Ar-Rahman verse plus his verse) and the 3 cards he approved without comment (dates-palms, speech-writing, sleep) set to `reviewed`, 21 of 25 mappings reviewed; MIT license for the code; accessibility and usability audit with fixes (focus ring, focus behind the tab bar, sheet focus, contrast, 200% text, favicon, judge hints); redesigned My Day share card (whole verses for reviewed mappings, line icons, Hijri date, QR invite, tested layout that never cuts a verse)

## Planned (not built yet)
- **Voice input: "tell Alaa what you noticed".** Besides the camera and the photo album, the user says what they are grateful for, e.g. "Today I slept eight hours for the first time", "A good evening with my family after a long while", "A shower with warm water", "I feel ill but could still go to work". Alaa then shows the related reference, Quran first.
  - Speech to text on the device where the browser supports it (Web Speech API), otherwise a server speech model; a typed box as the accessible alternative.
  - The text goes through the same rule as photos: the model returns only concept IDs from the closed list plus confidence (forced tool call). It never selects or writes religious text; concept → reference stays reviewed data, and every card passes the Source Guard.
  - New non-visual concepts for this (e.g. rest and sleep, time with family, warm water, health despite illness, free time), each with a reviewed mapping.
  - "Did you mean…?" confirmation before the card, as with photos.
  - Privacy: these sentences can carry health or family details. Audio and text are processed and discarded, never stored or logged, and no attribute is inferred or kept.
- **Better detection when no listed object fits.** Today a photo of something outside the closed list (e.g. a sofa) gets the general abstention (Ibrahim 14:34, An-Nahl 16:18). Planned: a scene layer that maps such photos to broader blessings (rest, free time, home, health).
  - Order of sources: a reviewed **Quran** reference first; a **sahih hadith only as a fallback** when no reviewed Quran mapping fits. Example: the hadith on health and free time, Bukhari 6412 (listed in `docs/SPEC.md` §9), for a sofa or a quiet moment.
  - Hadith go in only with: text copied from a licensed collection file in `sources/hadith/` with its LICENSE, collection and number, grade and grader, a hash check before rendering (like Guard level 1), the same review status and badge as Quran mappings, and a link to the source. Sources named by the challenge framework: hadeethenc.com (graded, with approved translations and an API) or dorar.net/hadith; Sahihayn first. No hadith text is typed by hand.
  - Built on the source-bound RAG below, which proposes candidates for the reviewer; nothing reaches users without review.
- **Align sources with the challenge framework.** Done Oct 5: English translation from the association's approved translations (quranenc.com, Rowwad). Next: check the Tanzil Arabic text against the King Fahd Complex developer files (qurancomplex.gov.sa/quran-dev) and switch if they differ; RAG over the association's MCP server (mcp.islamiccontent.org) and tafsir.net, both listed in the framework
- **Hadith where no verse fits** (reviewer's suggestion, Oct 6), e.g. for the hand: only from a verified, licensed hadith collection added with its license and checked by a Source Guard level like the Quran text; never typed or generated
- Deeper content for the "I know the Quran" stage (reflections with tafsir references), once reflections are reviewed
- Source-bound RAG: retrieval over approved, licensed sources to help choose references and refine mappings for the religious reviewer (see `docs/SPEC.en.md` §16; design in `docs/superpowers/specs/2026-10-05-rag-reviewer-assistant-design.md`). It proposes candidates for the 4 mappings still under review; the reviewer decides
- "Report an error" filed through `/api/report` (today: link to a prefilled GitHub issue)
- Live camera preview with `getUserMedia` (today: the system camera via `capture="environment"`)
- Durable daily limit (shared store such as Vercel KV); today it is per server instance, best effort
- Second real vision provider behind `VISION_PROVIDER` (today: `stub` fallback)
- Norwegian locale, once a translation license is confirmed
- Native SwiftUI version with on-device Vision (lower cost, better privacy)
- `sanad-core` shared with Mizan: Source Guard, source registry, source-card component
