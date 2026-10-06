# Results

Measured as described in `METHODOLOGY.md`. Numbers are filled from `eval/results/` and the user-testing results; nothing here is estimated.

## Recognition (full evaluation)
**Run 1 · 2026-10-05 13:50 Riyadh** · `claude-haiku-4-5` · 34 labelled photos × 3 runs per approach · raw data: `eval/results/2026-10-05T10-50-51-707Z.json`

| Approach | Accuracy | Consistency | Median latency | p95 latency | Cost per image |
|---|---|---|---|---|---|
| Alaa: closed list, forced tool call | 81/102 (79%) | 33/34 (97%) | 1.7 s | 2.2 s | $0.0041 |
| Alternative: free labels + manual mapping | 90/102 (88%) | 34/34 (100%) | 1.5 s | 2.0 s | $0.0020 |

On this set the alternative was more accurate and cheaper; Alaa's target (≥ 85%) was **not** met. Both met the consistency target (≥ 90%) and the latency target (< 4 s).

**By group (photos correct in all three runs):**
| Group | Alaa | Alternative |
|---|---|---|
| Blessings on the list (12 new + 5 earlier) | 16/17 | 16/17 |
| Off the list / known with no verse (8 + keyboard) | 6/9 | 8/9 |
| Ambiguous (3) | 2/3 | 3/3 |
| Two objects (2) | 1/2 | 1/2 |
| Person (2 + hand photo) | 2/3 | 2/3 |

**Why Alaa missed (raw candidates checked after the run):**
- **Background concepts on off-list photos (3 photos):** the subject is recognised with high confidence but has no verse (laptop 0.95, bicycle 0.95, umbrella 0.95), and weaker background concepts from the list (plant, grass, window, daytime) turn the answer into "Is this…?" instead of the polite no-verse abstention. The alternative names only the main objects, so it abstains.
- **Privacy rule on a held object (1 photo):** in "water and dates" the model flags a person (hands holding a tray); by design only "eye" or "hand" may then be offered, so the glass of water (0.85) is dropped. This is the CLAUDE.md privacy rule working as intended, at a cost to accuracy.
- **Face (1 photo):** with a face, the model offers "eye" (0.70) as an "Is this…?". The label expected an abstention, but offering "eye" when clearly visible is allowed by the app's rule; label and policy disagree here.
- **Bokeh lights (1 photo):** read as "night" (0.85), giving the night-and-day card; the label expected an abstention.
- **Dates in a crate (1 photo):** read as "grain" (0.95) by Alaa and as "cacao" by the alternative; both wrong.

**Change made because of run 1 (`lib/vision/decide.ts`):** when the main subject is confidently recognised but has no verse, another concept is offered only if it is itself confident (≥ 0.75). Weaker background concepts no longer turn "no verse for this" into "Is this…?". Unit tests added; the privacy rule, labels and photos were left unchanged.

**Run 2 · 2026-10-05 14:00 Riyadh** · same photos, labels and model, Alaa only · raw data: `eval/results/2026-10-05T11-00-10-290Z.json`

| Approach | Accuracy | Consistency | Median latency | p95 latency | Cost per image |
|---|---|---|---|---|---|
| Alaa after the change | **90/102 (88%)** | 33/34 (97%) | 1.7 s | 2.1 s | $0.0041 |
| Alternative (run 1) | 90/102 (88%) | 34/34 (100%) | 1.5 s | 2.0 s | $0.0020 |

The laptop, bicycle and umbrella now get the no-verse answer; "laptop and pen" still offers the pen; nothing that was correct in run 1 became wrong. Remaining misses: water and dates (privacy rule), face ("eye" offered), bokeh lights ("night"), loose dates ("grain"). The one inconsistent photo (sunlight) was correct in all three runs; only the background option in its "Is this…?" changed. Alaa now meets the accuracy target and matches the alternative, while only ever naming concepts from the reviewed list; the alternative stays cheaper.

**Why the alternative missed:** it names objects loosely, so the mapping misses or generalises: "hand holding olives" (dates) and "pastries" (dates) → abstain; "glass of carbonated water" → "water" rather than "drinking water" (still accepted); "orange sticky note" → orange fruit.

**Cost:** Alaa's call carries the full list of 122 concepts in the prompt and tool schema on every photo; the alternative's prompt is short. Prompt caching of that fixed part was measured on 2026-10-05 and does not apply: the fixed prefix (tools + system prompt) is about 3,000 tokens, below Claude Haiku 4.5's 4,096-token minimum for caching, and the API reports 0 cache reads and 0 cache writes on repeated calls (3,572 input tokens each, including the photo). Padding the prompt past the minimum would cost about $0.0051 for the first call in each 5-minute window and about $0.0004 for later ones, against about $0.0030 uncached, so it only pays off from about 2 photos per 5 minutes; at demo traffic it would likely cost more, and it would change a prompt whose accuracy we measured. We keep the cache marker so caching starts on its own if the concept list grows past the minimum.

### Earlier checks
- **Oct 4 (Day 1):** 7 sample photos × 3 runs with `claude-haiku-4-5`: 21/21 correct concept, 7/7 consistent, live round trip 2.1–2.9 s.
- **Oct 5 (Day 2) harness check:** the same 7 photos × 1 run, both approaches, to test the script (not a result). Label fix found: `my_hand.png` was labelled "abstain" from before the hand card existed; it now expects `hand`.

## RAG reviewer's assistant: retrieval (Phase 1)
**Run 1 · 2026-10-05 16:40 Riyadh** · 22 pairs: the 14 reviewed mappings in `sources/blessings.json` and 8 verses the reviewer suggested (`sources/REVIEW_LOG.md`) · roots + keywords, no embeddings yet · re-ranker `claude-haiku-4-5` · raw data: `rag/results/2026-10-05T13-40-18-714Z.json`

| Stage | Recall (reviewer's verse found) | MRR |
|---|---|---|
| Final candidates (top 8, re-ranked) | 16/22 (73%) | 0.49 |
| Fused retrieval (top 30) | 17/22 (77%) | 0.32 |
| Arabic roots only (top 30) | 55% | 0.19 |
| Keywords only (top 30) | 68% | 0.38 |
| Meaning (embeddings) | not built yet (no Voyage key) | — |

Cost: $0.0055 per question (re-ranker only; retrieval runs locally).

**Where it works:** pearls, clothing, sea, pomegranate, honey, milk, drinking water and the sky suggestion come first; water, ships, livestock and the night suggestion second. Re-ranking lifts the reviewer's verse higher than fused retrieval alone (MRR 0.32 → 0.49).

**Where it misses (6):** rain (50:9), home (16:80), family (16:72), eyes and tongue (67:23, 30:22) and hand (16:53) are not among the 30 retrieved candidates, and for crops and grain the re-ranker left out the verse that retrieval found (rank 7). Hand is expected: the reviewer chose a verse about every blessing because no verse presents the hand itself as one. The others are verses whose wording differs from the concept's name, which is what the missing meaning channel is for.

**Scores:** the reviewer's verse scored 0.85–1.00 when found, but most other candidates scored as high (median 0.90), so scores do not separate good from weak candidates; the cutoff stays 0.5 (`docs/DECISIONS.md`). The reviewer should read the candidates in order.

**Caveats:** a small set; 14 of the pairs are the cards' current verses, chosen with this data in view. These are proposals for a qualified reviewer, never answers shown to users.

## Religious text
0 unverified religious text: the Source Guard tests pass on every commit (72 unit tests on Oct 5).

## User testing
1 response by the deadline (no in-person sessions): too few to score or compare, so no user-study results are claimed. See `docs/user-testing/RESULTS.md` and row 1 of `docs/CHANGES_FROM_TESTING.md`.

## Accessibility audit (Oct 6)
Before the fixes, on the live site: Lighthouse accessibility 100 (Arabic) and 96 (English, colour contrast), best practices 96 (favicon error); axe-core found colour-contrast issues on small text, and keyboard checks found a focus ring too faint on light pages, focused items hidden behind the tab bar and focus lost after sheets. After the fixes (`66b6587`), the same axe and keyboard scripts on a local production build: no axe violations, no hidden focused items, focus returns after every sheet, no sideways scroll at 200% text. Details in `docs/CHANGES_FROM_TESTING.md`. This is an audit, not user testing.

## Changes made because of testing and review
See `docs/CHANGES_FROM_TESTING.md` and `sources/REVIEW_LOG.md`.
