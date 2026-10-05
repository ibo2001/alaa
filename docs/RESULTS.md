# Results

Measured as described in `METHODOLOGY.md`. Numbers are filled from `eval/results/` and the user-testing results; nothing here is estimated.

## Recognition (full evaluation)
_To be filled on Day 3 (Oct 6) from `npx tsx eval/run.ts` on the full image set (≈30 photos × 3 runs)._

| Approach | Accuracy | Consistency | Median latency | p95 latency | Cost per image |
|---|---|---|---|---|---|
| Alaa: closed list, forced tool call | [__] | [__] | [__] | [__] | [__] |
| Alternative: free labels + manual mapping | [__] | [__] | [__] | [__] | [__] |

### Earlier checks
- **Oct 4 (Day 1):** 7 sample photos × 3 runs with `claude-haiku-4-5`: 21/21 correct concept, 7/7 consistent, live round trip 2.1–2.9 s.
- **Oct 5 (Day 2) harness check:** the same 7 photos × 1 run, both approaches, to test the script (not a result). Label fix found: `my_hand.png` was labelled "abstain" from before the hand card existed; it now expects `hand`.

## Religious text
0 unverified religious text: the Source Guard tests pass on every commit (70 unit tests on Oct 5).

## User testing
See `docs/user-testing/RESULTS.md` (sessions pending).

## Changes made because of testing and review
See `docs/CHANGES_FROM_TESTING.md` and `sources/REVIEW_LOG.md`.
