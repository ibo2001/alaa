# BASELINE — نسخة الأساس

> هذا الملف يوثّق حالة مشروع «آلاء» قبل بدء أيام التحدي، التزاماً بدليل المشارك: يجوز استخدام عمل سابق «مع توثيق نسخة البداية والإفصاح عن الحقوق، ويُقيَّم ما أُنجز من ٤ إلى ٦ أكتوبر فقط».
>
> This file documents the state of the Alaa project before the challenge days began, as required by the participant guide. Only work done Oct 4–6, 2026 is to be evaluated.

| | |
|---|---|
| **Baseline tag** | `baseline` |
| **Baseline commit** | `<commit-hash>` |
| **Baseline time** | 2026-10-04, before 09:00 Riyadh time (UTC+3) |
| **Challenge window** | Oct 4–5: 09:00–22:00 · Oct 6: 09:00–23:59 (Riyadh time) |

To verify: `git show baseline` shows exactly what existed before the challenge. Everything after that tag was built during the challenge window (`git log baseline..HEAD`).

---

## 1. What existed before the challenge / ما كان موجوداً قبل التحدي

### Planning and design (not code)
| Item | Description | Location |
|---|---|---|
| `SPEC.md` / `SPEC.en.md` | Product and technical specification (Arabic / English) | `docs/` |
| Registration pitch | 10-slide pitch submitted with the registration form | `docs/alaa-pitch.pdf` |
| Visual identity | Colors, typography and logo direction, shared with the sister project Mizan | Linked in `docs/SOURCES.md` |
| Seed blessing list | 25 concept → verse references (references only, unreviewed) | Inside `SPEC.md` §9 |

### Data prepared before the challenge
Tick only what is actually in the baseline commit; delete the rest.

- [ ] `sources/quran/` — Quran text from Tanzil, unmodified, with its terms of use file
- [ ] `sources/concepts.json` — closed concept list (draft)
- [ ] `sources/blessings.json` — concept → verse references (draft, `status: "draft"`, not religiously reviewed)
- [ ] `tests/images/` — test image set (count: ___)

### Application code
- [ ] **No application code existed before the challenge.** The repository at `baseline` contains only the documents and data listed above.
- [ ] (If not true, list here every pre-existing code file or package and where it came from.)

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
