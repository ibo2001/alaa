# Content decisions

Decisions about religious content made by Ibrahim (project owner). These are product decisions, **not** religious review: nothing here changes a `review` status. Reviews are recorded only in `sources/REVIEW_LOG.md`.

| Date | Topic | Decision | Where |
|---|---|---|---|
| 2026-10-04 | Abstention | Show both Ibrahim 14:34 and An-Nahl 16:18, each whole on its own card with surah name and ayah number, navigable. Never show part of an ayah. | `sources/blessings.json` → `abstention`; lens |
| 2026-10-04 | Hand | Interim: the hand card shows the refrain, Ar-Rahman 55:13, with the "mapping under review" badge, until a reference is chosen through the planned source-bound RAG process. | `sources/blessings.json` → `hand` |
| 2026-10-04 | Family | Not offered to the vision model (would require analyzing people). Card reachable from the journey and My Day only. | `sources/concepts.json` → `recognizable: false` |
| 2026-10-04 | Concept splits | Compound §9 entries split into camera concepts (palm tree → dates and palms; bed → sleep; pen, handwriting → speech and writing; mouth → eyes and tongue; sheep, cow, camel, goat → livestock; wheat, grains → crops and grain; olive, moon, tree, coral, daytime → their paired entries). Approved as an initial version; all remain draft. | `sources/blessings.json` → `relatedConcepts` |
| 2026-10-04 | Referral | After the journey, "Have a question about Islam?" links to IslamQA (islamqa.info/ar, islamqa.info/en). Alaa itself never answers religious questions. | `sources/referral.json`; journey |
| 2026-10-04 | Future | Integrate source-bound RAG so results follow approved sources and sharia standards more closely. | `docs/SPEC.md` §16, `docs/ROADMAP.md` |
| 2026-10-05 | Review follow-up | The 4 Journey cards the reviewer asked to replace (sun-moon, sky, stars-trees, sea) keep their Ar-Rahman verse first, because the Journey follows the surah's order, and add the reviewer's suggested verses after it. Still draft until he confirms. | `sources/blessings.json`; `sources/REVIEW_LOG.md` |
| 2026-10-05 | Home verse | Home shows "A blessing verse": a general reminder, not an answer about an object, so it is not limited to reviewed mappings. Verses come only from references already in `blessings.json` and the abstention (one item per reference, the refrain excluded), each through the Source Guard, followed by the refrain. At night (19:00–04:59 on the device) about half the picks come from night-day, sleep and stars-trees; by day from sun-moon, sky and rain. | `sources/home.json`; `lib/home.ts`; Home |
