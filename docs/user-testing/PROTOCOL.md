# User testing protocol

For the "Benefit per track criterion" metric in `docs/SPEC.en.md` §11. Run by Ibrahim on Day 2 (Oct 5). Results go in `RESULTS.md`; changes made because of testing go in `docs/CHANGES_FROM_TESTING.md`.

**Two ways to run it:** in person with the printed sheets (below), or remotely with the online forms (`FORM.md`). Report which mode each participant used.

## Question
Do people who spend 5 minutes with Alaa link an everyday blessing to its place in the Quran, and explain the refrain, better than people who read the same verses in a regular mushaf app?

## Participants
- 8–10 adults (18+). Any background; nobody is asked about their religion.
- Split into two groups by arrival order: odd numbers → **A (Alaa)**, even numbers → **B (comparison)**. This keeps the groups balanced without choosing who goes where.
- Each person gets an ID (P01, P02, …). No names are written on any sheet.
- Optional, self-reported: "How well do you know the Quran?" with the app's two answers ("I'm new to the Quran" / "I know the Quran"). Recorded only if they choose to answer, so results can be read per stage.

## Consent
Print `participant-sheet.ar.pdf` or `participant-sheet.en.pdf` (A4, two pages; rebuild with `npx tsx scripts/participant-sheets.ts`). Page 1 is the consent: read it or hand it over before the session and get a yes. Page 2 is the questions: hand it over only after the 5 minutes. Write the same ID on both pages. Anyone may stop at any time. No photos of participants, no audio or video recording. Results are published only in aggregate and anonymously (SPEC §10).

## Setup
- One phone with the live app open: https://alaa-alpha.vercel.app (Arabic or English, the participant's choice). Clear site data before each Alaa session so My Day and the journey start empty.
- Comparison phone or laptop with quran.com open, and the four links below ready.
- The same three blessings for both groups, matching the app's sample photos:

| Blessing | Group A sees (sample or a real object) | Group B reads on quran.com |
|---|---|---|
| Water to drink | Card "Drinking water" | https://quran.com/56/68-70 |
| Dates and palms | Card "Dates and palms" | https://quran.com/55/11 |
| The sky | Card "Sky" | https://quran.com/55/7 |
| The refrain | On every card | https://quran.com/55/13 |

## Session (about 12 minutes per person)
1. Consent and the optional familiarity question (1 min).
2. **5 minutes** with the group's tool:
   - **A:** "This app recognizes everyday things. Try it on a glass of water, dates and the sky, with real objects or the sample photos. Add what you like to My Day. Then open the Journey and go as far as you like." Do not explain the refrain or the verses.
   - **B:** "Please read these four verses in this app, at your own pace." Same 5 minutes, no explanation.
3. Questions on the participant sheet, answered in writing or out loud (5 min). The sheet has no group label.
4. Observation notes (group A only, by Ibrahim): stations completed in the journey (count from the Journey screen), anything that confused them, errors.

## Scoring
Scored after all sessions, sheet by sheet, **without looking at the group** (sheets are shuffled; the ID → group list is kept separately).

| Question | Score |
|---|---|
| Q1–Q3: where the Quran mentions the blessing | 2 = names the surah (or the right ayah) **and** says what the verse says about it · 1 = one of the two · 0 = neither |
| Q4: the meaning of the refrain | Compare with the licensed translation of 55:13 as the app shows it (Talal Itani). 2 = the same meaning in the participant's words · 1 = partly · 0 = no idea or wrong. This sheet does not restate the meaning, by the project rule against paraphrasing Quran text. |
| Q5: another everyday blessing the Quran mentions | 1 = any plausible example · 0 = none |
| Q6–Q7: 1–5 ratings | as given |

## Measures
- **Linking score:** Q1–Q3 summed (0–6), mean per group.
- **Refrain score:** Q4 (0–2), mean per group.
- **Journey continuity (A only):** share of participants who completed ≥ 3 stations. Target ≥ 60%.
- **Tone check:** Q7 ("it felt like being preached to"), mean per group. Lower is better.

With 8–10 people this is an indicative comparison, not a statistical test. Report the numbers as they are, including any result that does not favor Alaa.

## After testing
For each problem observed, write a row in `docs/CHANGES_FROM_TESTING.md` (observed → changed → commit). The target is at least 2 documented improvements (SPEC §11).
