# Evaluation images

Test photos for `eval/run.ts`. Images stay **local** (git-ignored) unless their licence is documented; only `labels.json` and this file are committed. Your own phone photos are ideal.

## What to add (target: about 30 in total, 7 are here already)
| Kind | How many | Examples | Label |
|---|---|---|---|
| A blessing in the list, clear | ~12 | a glass of water, dates, bread or wheat, milk, honey, a bed, clothes, a cat or sheep, the sky, a tree, the sea, a mountain | the concept id, e.g. `"drinking_water"` |
| Out of the list | ~5 | a traffic cone, a violin, a stapler, a remote control | `"abstain"` |
| A known object with no verse | ~3 | a keyboard, a laptop, a sofa | `"abstain"` |
| Ambiguous | ~3 | a glass of an unclear liquid, a blurry photo, a dark room | `"abstain"`, or the ids you would accept |
| Two objects | ~2 | dates next to a glass of water | both ids: `["date_fruit", "drinking_water"]` |
| A person | ~2 | a hand holding something, a face | `["hand"]`, `["eye"]`, or `"abstain"` for a face |

Any format the phone produces works (`.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`). Name files plainly, e.g. `bread-on-table.jpg`. No need to resize: the script downscales to 768px like the app.

## Labels
`labels.json` maps each file to what counts as correct:

```json
{ "glass.jpg": "drinking_water", "two-things.jpg": ["date_fruit", "drinking_water"], "violin.jpg": "abstain" }
```

A card or an "Is this…?" that includes an accepted id counts as correct; for `"abstain"` only an abstention counts. For an ambiguous photo, `"abstain"` can be one of the accepted answers, e.g. `["abstain", "tree"]`. Concept ids are in `sources/concepts.json`. Unlabelled images are skipped (and listed), so you can drop photos in and I'll write the labels.

## Run
```
npx tsx eval/run.ts                 # all labelled images × 3 runs, both approaches
npx tsx eval/run.ts --runs=1        # quick check
npx tsx eval/run.ts --approach=constrained
```
Results: `eval/results/latest.md` (tables) and `eval/results/<timestamp>.json` (every call).
