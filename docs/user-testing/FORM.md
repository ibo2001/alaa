# Online form (remote user testing)

The remote version of `PROTOCOL.md`: one Google Form per language, created in Ibrahim's Google account by `scripts/study-form.ts` (the Arabic text is in that script). Same questions as the printed participant sheet, plus three questions that replace what the moderator would observe in person.

**Links:** `forms.json` (A and B per language, plus the edit link). **Results:** `npx tsx scripts/study-results.ts fetch`, score `user-testing-private/scoring.csv` blind, then `npx tsx scripts/study-results.ts summarize`.

## Settings
- No email collection, no Google sign-in required, responses not limited to one per person (that limit forces sign-in).
- Participants don't see other people's answers or a results summary.
- Two pre-filled links per language: **A** (Alaa) and **B** (comparison). Send A and B alternately, in the order people agree to take part.

## Section 1 · Welcome
**Title:** Alaa · a short study (about 12 minutes)

Thank you for helping. You will spend about 5 minutes with an app or a website, then answer a few short questions.

- This tests the app, not you. There are no wrong answers.
- We don't ask for your name or email.
- You can stop at any time, without giving a reason.
- Answers are published only as combined, anonymous results.

**Do you agree to take part?** (required) ○ Yes, I agree ○ No
→ "No" ends the form.

## Section 2 · About you
**Session code** (required; already filled in from your link, please don't change it) ○ A ○ B
→ A goes to section 3A, B goes to section 3B.

**Optional: how well do you know the Quran?** ○ I'm new to the Quran ○ I know the Quran ○ Prefer not to say

## Section 3A · Your 5 minutes (app)
1. On your phone, open **https://alaa-alpha.vercel.app** (Arabic or English, as you like).
2. Try it on a glass of water, dates and the sky: real objects around you, or the sample photos in the lens.
3. Add what you like to "My Day".
4. Open the "Journey" and go as far as you like.

Spend about 5 minutes. Before you close the app, open the Journey screen once more.

**The Journey screen says "… of 7 stations". What is the number?** (short answer, number)

Now close the app, and please don't open it again while you answer. → Section 4

## Section 3B · Your 5 minutes (reading)
Please read these four verses on quran.com, at your own pace, for about 5 minutes:

- https://quran.com/56/68-70
- https://quran.com/55/11
- https://quran.com/55/7
- https://quran.com/55/13

Then close the page, and please don't open it again while you answer. → Section 4

## Section 4 · Questions
Answer in your own words. "I don't know" is a fine answer.

1. Where in the Quran is **water we drink** mentioned, and what does the verse say about it? (paragraph)
2. Where in the Quran are **dates and palm trees** mentioned, and what does the verse say about them? (paragraph)
3. Where in the Quran is **the sky** mentioned, and what does the verse say about it? (paragraph)
4. In Surah Ar-Rahman, one ayah is repeated many times. What does it mean, in your own words? (paragraph)
5. Name one other everyday thing that you think the Quran draws attention to. (short answer)
6. "I would like to use this again tomorrow." (scale 1 Strongly disagree – 5 Strongly agree)
7. "It felt like being preached to." (scale 1 Strongly disagree – 5 Strongly agree)
8. What, if anything, confused you? (paragraph, optional)
9. What one thing would you change? (paragraph, optional)
10. About how long did you spend with the app or website? ○ Less than 3 minutes ○ 3–7 minutes ○ More than 7 minutes
11. Did you look at the app or website again while answering? ○ No ○ Yes (that's fine, please just tell us)

**After submitting:** "Thank you. Your answers help make Alaa better."

## Scoring and reporting
Same rubric as `PROTOCOL.md`. Responses are fetched with `gws forms forms responses list`, kept out of the repo, and scored with the session code hidden. Only the anonymous summary goes into `RESULTS.md`. Responses that answered "Yes" to question 11, or spent under 3 minutes, are reported separately.
