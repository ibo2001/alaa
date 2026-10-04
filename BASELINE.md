# BASELINE — نسخة الأساس

> هذا الملف يوثّق حالة مشروع «آلاء» قبل بدء أيام التحدي، التزاماً بدليل المشارك: يجوز استخدام عمل سابق «مع توثيق نسخة البداية والإفصاح عن الحقوق، ويُقيَّم ما أُنجز من ٤ إلى ٦ أكتوبر فقط».
>
> This file documents the state of the Alaa project before the challenge days began, as required by the participant guide. Only work done Oct 4–6, 2026 is to be evaluated.

| | |
|---|---|
| **Baseline tag** | `baseline` |
| **Baseline commit** | `70addb4` (committed 2026-10-04 08:46 +03) |
| **Baseline time** | 2026-10-04, before 09:00 Riyadh time (UTC+3) |
| **Challenge window** | Oct 4–5: 09:00–22:00 · Oct 6: 09:00–23:59 (Riyadh time) |

To verify: `git show baseline` shows exactly what was committed before the challenge. Everything after that tag was committed during the challenge window (`git log baseline..HEAD`).

> **Disclosure about the planning documents.** `docs/SPEC.md`, `docs/SPEC.en.md`, `docs/LINKS.md` and `CLAUDE.md` were written before the challenge (see §1) but were **not** included in the baseline commit by mistake. They were committed unchanged in the first commit after `baseline` (Oct 4, just after 09:00), moved into `docs/`. They contain planning only, no code. Compare their content with this description to verify.

---

## 1. What existed before the challenge / ما كان موجوداً قبل التحدي

### Planning and design (not code)
| Item | Description | Location |
|---|---|---|
| `SPEC.md` / `SPEC.en.md` | Product and technical specification (Arabic / English) | `docs/` |
| Registration pitch | 10-slide pitch submitted with the registration form | `docs/alaa-pitch.pdf` (to be added) |
| Visual identity | Colors, typography and logo direction, shared with the sister project Mizan | Linked in `docs/SOURCES.md` |
| Seed blessing list | 25 concept → verse references (references only, unreviewed) | Inside `SPEC.md` §9 |
| `CLAUDE.md`, `LINKS.md` | Standing instructions for Claude Code; project links | repo root, `docs/` |

### Data prepared before the challenge
None. `sources/` (Quran text, concepts, blessings) and any test images are added during the challenge.

### Application code
- [x] **No application code existed before the challenge.** The repository at `baseline` contains only `BASELINE.md`; the planning documents above followed in the next commit as disclosed.

---

## 2. Rights disclosure / الإفصاح عن الحقوق

| Item | Owner / source | Terms |
|---|---|---|
| Idea, specification, pitch, visual identity | Ibrahim Qraiqe (team) | Team's own work |
| Quran text | Tanzil Project (tanzil.net) | Used verbatim under Tanzil's terms; terms file included in `sources/quran/` |
| Translations | Listed per language in `docs/SOURCES.md` | Each translation's license file in `sources/translations/<lang>/` |
| Fonts: Aref Ruqaa, Amiri Quran, IBM Plex Sans Arabic | Their respective authors | SIL Open Font License; license files in the repo |
| Third-party npm packages | Their respective authors | Listed with licenses in `docs/SOURCES.md` |

### AI tools used before the challenge
- Claude (Anthropic) was used to help draft the specification, the pitch and the visual identity. All religious references in those documents are references only and are pending review by a qualified reviewer (see `sources/REVIEW_LOG.md`).

---

## 3. What the challenge work covers / ما يشمله عمل التحدي

Everything after `baseline`, including (per the plan in `SPEC.md` §12):
- The full Next.js PWA: lens, blessing card, My Day's Surah, Ar-Rahman Journey, source page
- `/api/see` vision endpoint with constrained output
- Source Guard and its tests
- Evaluation runs on the test set, user testing, and all submission materials
