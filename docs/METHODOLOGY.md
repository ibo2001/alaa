# Methodology

How Alaa is measured, so every number in `RESULTS.md` and the presentation can be re-run and checked. Targets come from `SPEC.en.md` §11.

## 1. Recognition: does the lens pick the right concept, or abstain?

**Data.** About 30 labelled photos in `eval/images/` (Ibrahim's own photos plus a few openly licensed ones; images stay local, `labels.json` is in the repo). They mix the cases in the SPEC's reliability plan: blessings on the list, objects outside the list, known objects with no verse (keyboard, laptop, sofa), ambiguous photos, photos with two objects, and photos with a hand or a face. Kinds and how to add photos: `eval/images/README.md`.

**Labels.** Each image lists the concept ids that count as correct, or `"abstain"`. A card or an "Is this…?" that includes an accepted id is correct; for `"abstain"` only an abstention is. Labels are written before the run and not changed after seeing results, except to fix a label that no longer matches the app (each such fix is noted in `RESULTS.md`).

**Approaches compared** (same model, same photos, same thresholds):
1. **Alaa (constrained):** the model must answer through a tool whose input is an `enum` of the 122 concept ids plus a confidence, at temperature 0 (`lib/vision/anthropic.ts`).
2. **Alternative (generic classifier + manual mapping):** the model names up to three objects in its own words; a fixed table built from each concept's id, English name and aliases maps those names to concept ids (`eval/alt.ts`). This stands in for "a general image classifier plus a hand-made mapping", the alternative named in the SPEC.

Both go through the app's own decision rule (`lib/vision/decide.ts`): card at confidence ≥ 0.75, "Is this…?" from 0.45 to 0.75, abstain below 0.45 or when nothing maps; with a person in frame, only "eye" or "hand".

**Runs.** Every image × 3 runs per approach (`npx tsx eval/run.ts`). Photos are downscaled to 768px exactly as the app does.

**Metrics.**
| Metric | Definition | Target |
|---|---|---|
| Accuracy | Calls that were correct or correctly abstained ÷ all calls | ≥ 85% |
| Consistency | Images whose decision was identical in all 3 runs ÷ images | ≥ 90% |
| Latency | Model call time per image, median and 95th percentile (from the evaluation machine; the live round trip through Vercel is measured separately on a phone) | capture-to-card < 4 s |
| Cost per image | From the API's token usage per call × the model's published prices (`lib/vision/pricing.ts`), averaged | documented |

**Model.** Whatever `VISION_MODEL` the live app uses (today `claude-haiku-4-5`), recorded in every result file.

## 2. Religious text: is anything unverified ever shown?
The Source Guard's four levels are unit-tested (`tests/unit/guard.test.ts`): altered Quran text blocks the card; a missing licence, missing text or an altered translation or footnote hides the translation; an unreviewed mapping shows the badge; an unreviewed reflection is never shown. Target: **0** unverified religious text, checked on every commit.

## 3. Benefit for users (track criterion)
Two groups, the same three blessings: group A uses Alaa for 5 minutes, group B reads the same verses on quran.com. Same questions afterwards, scored blind. Full protocol: `docs/user-testing/PROTOCOL.md`; results: `docs/user-testing/RESULTS.md`; changes made because of it: `docs/CHANGES_FROM_TESTING.md`.

## Limits
- About 30 photos is a small set; it shows the approach works and where it fails, not a population rate.
- The photos and labels come from the team, so they may favour objects the team expected.
- Both approaches use the same model; the comparison isolates the closed list and forced tool call, not the model.
- Cost uses list prices; caching makes later calls cheaper than the first, so the average depends on run order.
