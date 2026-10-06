# Changes from testing

Every problem seen in user testing (`docs/user-testing/`) that led to a change. Target: at least 2 (SPEC §11).

| # | Observed | Changed | Commit |
|---|---|---|---|
| 1 | The one online participant (Oct 6, group A) left within 3 minutes and wrote that they did not know what the app is for; their answers suggest they stayed on Home, which led with a verse card and explained Alaa only below the fold | First visit: Home starts with a short card saying why and how, with "Start looking" (to the lens) and "or try a sample photo", before the verse | `7bf4ea6` |

## From the accessibility and usability audit (Oct 6), not user testing
An automated and scripted audit of the live site (axe-core on 112 page states, Lighthouse, keyboard, 200% text, reduced motion, offline; Arabic and English, phone and laptop widths), run by an AI agent (Claude Code) because the online user-test forms had no responses yet. These are expert-style findings, not observations of real users. Fixed in `66b6587`.

| # | Observed | Changed |
|---|---|---|
| A1 | Gold focus ring nearly invisible on light pages (1.4:1 on sky) | Two-tone ring: navy outline with a gold halo |
| A2 | Fixed tab bar covered the focused item while tabbing (5 of 34 on Journey, 4 of 28 on Lens) | Scroll padding for both bars: 0 covered after the fix |
| A3 | Focus lost to the page after closing a Lens sheet; abstain sheet opened on a footnote link | Focus returns to the photo or button that opened the sheet; abstain sheet starts on its heading |
| A4 | Small grey text below 4.5:1 (axe `color-contrast`, Lighthouse a11y 96 in English) | Raised to 75% opacity: axe reports no violations after the fix |
| A5 | Review sheet: typed name was near-white on white | Inputs use the dark text colour and keep the native focus outline |
| A6 | At 200% text, tab labels ran together and the bar title overlapped the language button; About scrolled sideways | Labels wrap, title truncates, URL breaks: no sideways scroll |
| A7 | `/favicon.ico` returned 500 (console error, no tab icon) | Favicon added |
| A8 | Judges on a laptop met a camera button first; the after-journey page's unlock rule was not explained | "No camera? Try a sample photo" link in the viewfinder; the Journey says how a station is completed |
| A9 | Offline message talked about photos on every page; pulse and progress animations ignored reduced motion | Generic offline message; both animations respect reduced motion |
