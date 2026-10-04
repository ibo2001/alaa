# Alaa — آلاء
### A lens for seeing blessings

> ﴿فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ﴾ — Ar-Rahman 55:13 (repeated 31 times in the surah)
> *"So which of the favors of your Lord would you deny?"* (meaning)

**Version:** Draft 2 · October 4, 2026 (calibrated against the participant guide after acceptance)
**Build:** Progressive Web App (PWA) for the AI Challenge for Islamic Content (Oct 4–6, 2026)
**Track:** Track 3 (Interactive Experiences & Knowledge Journeys)

> English version of `SPEC.md` (Arabic). If they diverge, the Arabic is the reference for religious content and this file is the reference for code.

> **What changed in Draft 2:** the app's positioning (not a tafsir or fatwa app), four content levels with review gates, user-chosen learning stage and journey continuity, Arabic + English only, a measurement plan with baseline comparisons, and a map from every part to the final judging criteria (§14).

---

## 1. The idea in two lines

The user points their phone camera at an everyday object: a glass of water, a date, the sky, their own hand. AI recognizes the object; the app shows where the Quran mentions it, from a verified source, with a short reflection, then the refrain: **"So which of the favors of your Lord would you deny?"** At the end of the day these moments are collected into **"My Day's Surah"**, a shareable card built on the rhythm of Surah Ar-Rahman.

### What Alaa is, and what it is not
- **It is:** technology that helps people **notice the blessings** they have grown so used to that they no longer see them. Its job is to connect something in front of you to where it is mentioned in the Quran.
- **It is not:** a mushaf app, a tafsir, a fatwa service, or a Q&A for religious questions. The app says nothing of its own about religion; every religious text is shown verbatim from a verified source with its reference.
- **Boundary with Mizan:** Alaa is about *seeing* and noticing blessings. Reducing waste and consumption belongs to the sister app, Mizan.

## 2. The problem

- **Taking blessings for granted:** what we see every day (water, sleep, sight) fades into the background, and gratitude weakens. Sahih hadith: "Two blessings many people lose out on: health and free time" (Bukhari 6412).
- Many non-Muslims and new Muslims know the Quran only as a book of rulings, not as a book that keeps drawing attention to daily life.
- Gratitude journaling is a global trend, but without a reference point connecting gratitude to the Giver.
- Islamic content apps are mostly text-first and rarely start from what the user is looking at right now.

**Guide's format:** Our project addresses **people taking everyday blessings for granted, and not knowing the Quran draws attention to them**; success is measured by **users' ability to connect a blessing in front of them to its place in the Quran and explain the refrain, compared with reading the same verse in a regular mushaf app** (§11).

## 3. Target users

| Segment | What they want | How Alaa serves them |
|---|---|---|
| Curious non-Muslim | A calm, non-preachy entry point | Starts from something familiar (water), then a verse translated into their language |
| New Muslim | Connecting the Quran to daily life | "My Day's Surah" as a short daily habit |
| Muslims in general | Renewed attention to blessings | Shareable cards |
| People who introduce Islam (du'at) | A practical conversation tool | Show the app and start the conversation from it |

**Note:** these segments are for design only. The app **never asks about or infers religion** (required by the Track 3 success criterion).

## 4. User experience

### Learning stage (user-chosen personalization)
On first launch, one optional question, changeable later in settings:
- "I'm new to the Quran" → simpler reflection, plus a one-line intro to Surah Ar-Rahman and the refrain.
- "I know the Quran" → deeper reflection with tafsir references.

Stored on the device only; never inferred from behavior.

### Main flow
```
Open app ─▶ "Look" (camera) or "Sample photos"
      │
      ▼
Capture ─▶ AI recognition (concept from a closed list + confidence)
      │
      ├─ High confidence + concept in DB ─▶ Blessing card:
      │       1. Blessing name (Arabic + user's language)
      │       2. Verse (Uthmani text from Tanzil) + licensed translation + reference
      │       3. "Reflect": two reviewed lines (shown only if the card is reviewed)
      │       4. Refrain
      │       5. [Add to My Day] [Share] [Source] [Read in context ↗]
      │
      ├─ Medium confidence ─▶ "Is this ...?" (pick from 3 candidates)
      │
      └─ Unknown / not in DB ─▶ Polite abstention:
              "I couldn't find a verse about this specifically, but:
               ﴿وإن تعدوا نعمة الله لا تحصوها﴾ (Ibrahim 14:34)"
              + "Try something else around you"
```

- **Sample photos:** bundled images (water, dates, sky, hand...) so a judge on a laptop, with no camera or objects nearby, can still try the full flow.
- **Read in context:** a link to the verse on quran.com so users see it within its surah and judges can verify the text themselves.

### "My Day's Surah"
- The day's blessings in the rhythm of Surah Ar-Rahman: one line per blessing, then the refrain in gold.
- Stored locally only (IndexedDB). No account, no server.
- Exports a 1080×1920 share card drawn on-device with Canvas.

### "Ar-Rahman Journey" (graduated, continuing path)
- 7 stations in the surah's order: man and speech; sun and moon; stars and trees; sky and the balance; earth, fruit and palms; the two seas; pearls and coral.
- Each station has one photo mission ("Find a fruit near you and photograph it").
- **After station 7 (journey continuity):**
  1. Read all of Surah Ar-Rahman with translation (quran.com link).
  2. Suggested daily habit: "My Day's Surah" every evening.
  3. **Referral to human support:** "Have a question about Islam? Talk to a specialist" → link to a recognized organization.
- This moves the user from first interest (a photo) to learning (the journey) to follow-up (a daily habit), which is the Track 3 description.

## 5. Screens

1. **Welcome:** refrain in large type, language (Arabic / English), learning stage, "Start looking".
2. **Lens:** circular camera preview, shutter, gallery upload, sample photos.
3. **Blessing card:** verse, translation, reflection, refrain, actions.
4. **My Day:** list, "7 blessings today" counter, "Share my day".
5. **Ar-Rahman Journey:** seven stations with status, plus the "after the journey" screen.
6. **Source:** surah and ayah, text source, translation with translator and license, review status with reviewer and date, quran.com link.
7. **About:** what Alaa is and is not (§1), methodology, report an error.

## 6. What the AI does, and where it stops

**Principle:** the AI only **sees**. It never **speaks about religion**.

| Task | Done by | Notes |
|---|---|---|
| Recognize the object | Vision LLM | Forced to choose from a closed enum of ~120 concepts, with confidence |
| Pick the verses | Static map `concept → verses[]` | No generation |
| Verse text | Local Tanzil Uthmani file | Never passes through the model |
| Translation | Licensed published translations | Translator name always shown |
| Reflection text | Pre-written and reviewed | Model may help at editing time only; a specialist reviews |

### Why a vision LLM with constrained output?
- **Simpler alternative 1:** the user picks a blessing from a list. Works, but loses the core idea: starting from what is in front of you and *discovering* the blessing.
- **Simpler alternative 2:** a generic image classifier (e.g. ImageNet labels) plus manual mapping. Its labels don't match Quranic concepts ("sight", "the sky" in the Quranic sense).
- **Dangerous alternative:** free-form description, then the model picks a verse. That opens the door to generated religious content. **Not allowed in Alaa.**
- **Choice:** a vision LLM choosing from a closed list designed around Quranic concepts, with confidence and abstention. We measure its advantage over alternative 2 (§11).

### Vision model output (Structured Output)
```json
{
  "candidates": [
    { "concept": "water", "confidence": 0.93 },
    { "concept": "glass_vessel", "confidence": 0.41 }
  ],
  "is_person": false,
  "unsafe": false
}
```
- **Thresholds:** ≥ 0.75 show the card · 0.45–0.75 ask "Is this...?" · < 0.45 abstain.
- `is_person = true`: never analyze the person or infer age, religion or any sensitive attribute. Only offer "eye" or "hand" if clearly visible.
- `unsafe = true`: abstain with a gentle message.

## 7. Reliability and religious safety

### Content levels and their gates

| Level | Example | Source | Gate before rendering |
|---|---|---|---|
| 1. Quran text | ﴿والسماء رفعها...﴾ | Tanzil (Uthmani, unmodified); cross-checked against quran.com | **Hard:** hash must match the Tanzil text, otherwise the card is not shown at all |
| 2. Translation | English translation | Published translation with documented license | Present in `sources/translations/` with its license and translator name |
| 3. Mapping (blessing → verse) | water → 21:30 | Manual table | Needs religious review; until then shows a "mapping under review" badge |
| 4. Reflection | Two lines | Written, reviewed, with a tafsir reference | **Shown only when `status === "reviewed"`** |

**On sources:** Tanzil provides the verified Quran text and a set of translations, not tafsir. Reflection references therefore point to printed tafsir works (Ibn Kathir, As-Sa'di, At-Tabari) by name, and the quran.com link lets users read the tafsir published there.

### Controls
1. **Closed database:** no religious text outside `sources/` is ever shown.
2. **Source Guard:** enforces the gates above in code, covered by automated tests.
3. **Abstention:** concept not in the DB → fixed general text (Ibrahim 14:34).
4. **Review log:** `REVIEW_LOG.md` records per card: reviewer, their qualification, date, notes. Shown on the Source page.
5. **No "scientific miracle" claims:** reflections stay within the plain meaning and cited exegetes.
6. **Report an error:** on every card, filed to GitHub Issues.
7. **Referral:** any religious question → link to a recognized authority, never an answer.

### Religious review
- Ibrahim is recruiting a qualified reviewer for the mappings and reflections; their name and qualification go into `REVIEW_LOG.md` with their consent.
- Until review is done, cards run on levels 1 and 2 only, with the "under review" badge on the mapping, and reflections hidden. Nothing is ever presented as reviewed when it isn't.
- The challenge's religious mentoring sessions can be used too, documenting exactly what was reviewed and by whom.

### Reliability test plan
| Case | Example | Expected |
|---|---|---|
| Critical: altered text | Change one letter in a verse file | Guard blocks rendering (automated test) |
| Critical: unreviewed card | `status: "draft"` | Reflection hidden |
| Critical: photo of a person | A face | No attribute inference |
| Critical: inappropriate content | — | Abstain |
| Out of list | Keyboard | Abstain + 14:34 |
| Ambiguous | Glass with unclear liquid | "Is this...?" |
| Conflict: multiple objects | Dates next to a glass of water | Show candidates to choose from |
| Repeatability | Same image 3 times | Same decision all 3 times (consistency rate measured) |

## 8. Technical architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Instant deploy on Vercel |
| UI | Tailwind CSS (RTL) + Amiri Quran (verses) + IBM Plex Sans Arabic (UI) + Aref Ruqaa (headings) | Full RTL support |
| PWA | Serwist (`@serwist/next`) | Installable; offline database |
| Camera | `<input type="file" accept="image/*" capture="environment">` + `getUserMedia` | iOS Safari and Android Chrome |
| AI | `/api/see` → vision model (Claude by default) behind a swappable `VisionProvider`, with a ready fallback provider | Keys stay server-side |
| Religious data | JSON in `sources/` | Auditable via Pull Requests |
| Local storage | IndexedDB via `idb-keyval` | "My Day" and learning stage stay on device |
| Share card | Canvas API | Ready-to-share image |
| i18n | `next-intl` | **ar / en** (Norwegian later, once a translation license is confirmed) |
| Testing | Vitest (Guard) + Playwright (flow) + image evaluation script | Prove reliability with numbers |

### Repository layout
```
alaa/
├─ app/
│  ├─ [locale]/
│  │  ├─ page.tsx               # Welcome (language + learning stage)
│  │  ├─ lens/page.tsx          # Lens (camera, upload, sample photos)
│  │  ├─ blessing/[id]/page.tsx # Blessing card
│  │  ├─ today/page.tsx         # My Day's Surah
│  │  ├─ journey/page.tsx       # Ar-Rahman Journey + after-journey screen
│  │  ├─ source/[id]/page.tsx   # Source page
│  │  └─ about/page.tsx         # What Alaa is / is not, methodology
│  └─ api/
│     ├─ see/route.ts           # image ▶ concepts
│     └─ report/route.ts        # error report ▶ GitHub Issue
├─ lib/
│  ├─ vision/                   # VisionProvider, providers, prompt, schema
│  ├─ guard/                    # Source Guard (level gates)
│  └─ share/                    # share-card rendering
├─ public/samples/              # sample photos for judges
├─ sources/
│  ├─ quran/                    # Tanzil text (unmodified) + terms
│  ├─ translations/en/          # translation + LICENSE
│  ├─ concepts.json
│  ├─ blessings.json
│  └─ REVIEW_LOG.md
├─ eval/
│  ├─ images/                   # 100-image test set + labels.json
│  ├─ run.ts                    # runs N times, writes results/
│  └─ results/                  # committed results for re-checking
├─ tests/
├─ .env.example
├─ BASELINE.md
├─ README.md
└─ docs/  (SOURCES.md, METHODOLOGY.md, RESULTS.md)
```

### Data model
```ts
type Lang = "ar" | "en";
type Stage = "new" | "familiar";   // chosen by the user, never inferred

type Concept = {
  id: string;                      // "water"
  labels: Record<Lang, string>;
  aliases?: string[];              // helps the model: "cup of water", "rain"
};

type VerseRef = { surah: number; ayah: number; ayahEnd?: number };

type ReviewStatus = "draft" | "reviewed";

type Blessing = {
  id: string;                      // "water-1"
  concept: string;                 // → Concept.id
  verses: VerseRef[];              // text loaded from Tanzil at render time
  translations: { lang: Lang; source: string }[]; // translation id, not text
  reflection?: Record<Stage, Partial<Record<Lang, string>>>;
  tafsirRef?: { book: string; volume?: number; page?: number };
  hadith?: HadithRef[];
  journeyStation?: 1|2|3|4|5|6|7;
  review: {
    mapping: ReviewStatus;         // level 3 gate
    reflection: ReviewStatus;      // level 4 gate
    reviewer?: string;
    reviewedAt?: string;
  };
};

type HadithRef = {
  textAr: string;                  // copied from the source collection, never generated
  collection: "bukhari" | "muslim" | "tirmidhi" | "abudawud" | "nasai" | "ibnmajah" | "ahmad";
  number: number;
  grading: { grade: string; by: string }[]; // may hold several gradings
};
```

### Source Guard rules (implementation reference)
```ts
// Pseudocode; the real implementation lives in lib/guard/.
// Level 1 (hard): every verse text must hash-match the Tanzil file, else the card is not rendered.
// Level 2: each translation must exist in sources/translations/<lang>/ with a LICENSE.
// Level 3: review.mapping !== "reviewed" -> render "mapping under review" badge.
// Level 4: review.reflection !== "reviewed" -> reflection is not rendered.
```

### Sample from `blessings.json`
```json
{
  "id": "water-1",
  "concept": "water",
  "verses": [{ "surah": 21, "ayah": 30 }, { "surah": 56, "ayah": 68, "ayahEnd": 70 }],
  "translations": [{ "lang": "en", "source": "<licensed-translation-id>" }],
  "reflection": {
    "new": { "en": "Everything alive around you began with what is in this glass." },
    "familiar": { "ar": "…" }
  },
  "tafsirRef": { "book": "Tafsir As-Sa'di" },
  "journeyStation": 5,
  "review": { "mapping": "draft", "reflection": "draft" }
}
```

### Demo and availability
- Sample photos ship in `public/samples/`; their recognition results may be cached so judges always get an instant, consistent result.
- Per-device daily limit is raised for the demo, and the API budget covers the whole judging period (until Oct 22).
- Fallback vision provider configured via env, switchable without redeploying code.

## 9. Seed blessings database (25 concepts)

Standard mushaf numbering. English glosses are short paraphrases, not quoted translations. **The app always renders verse text from Tanzil, never from this table.** All mappings are drafts until reviewed.

| Concept | Verse (Arabic) | Meaning (paraphrase) | Reference |
|---|---|---|---|
| Water | ﴿وجعلنا من الماء كل شيء حي﴾ | We made every living thing from water | Al-Anbiya 21:30 |
| Drinking water | ﴿أفرأيتم الماء الذي تشربون﴾ | Have you considered the water you drink? | Al-Waqi'ah 56:68–70 |
| Rain | ﴿ونزّلنا من السماء ماءً مباركاً﴾ | We sent down blessed water from the sky | Qaf 50:9 |
| Dates and palms | ﴿فيها فاكهة والنخل ذات الأكمام﴾ | In it are fruit and palms with sheathed clusters | Ar-Rahman 55:11 |
| Pomegranate | ﴿فيهما فاكهة ونخل ورمان﴾ | In both are fruit, palms and pomegranates | Ar-Rahman 55:68 |
| Figs and olives | ﴿والتين والزيتون﴾ | By the fig and the olive | At-Tin 95:1 |
| Honey | ﴿يخرج من بطونها شراب مختلف ألوانه فيه شفاء للناس﴾ | From their bellies comes a drink of varied colors, a healing for people | An-Nahl 16:69 |
| Milk | ﴿نسقيكم مما في بطونه... لبناً خالصاً سائغاً للشاربين﴾ | We give you pure milk to drink, pleasant to drinkers | An-Nahl 16:66 |
| Sun and moon | ﴿الشمس والقمر بحسبان﴾ | The sun and moon move by precise calculation | Ar-Rahman 55:5 |
| Sky | ﴿والسماء رفعها ووضع الميزان﴾ | He raised the sky and set the balance | Ar-Rahman 55:7 |
| Stars and trees | ﴿والنجم والشجر يسجدان﴾ | The stars and trees prostrate | Ar-Rahman 55:6 |
| Sea | ﴿مرج البحرين يلتقيان﴾ | He released the two seas, meeting | Ar-Rahman 55:19 |
| Pearls | ﴿يخرج منهما اللؤلؤ والمرجان﴾ | From both come pearls and coral | Ar-Rahman 55:22 |
| Ships | ﴿وله الجوار المنشآت في البحر كالأعلام﴾ | His are the ships raised on the sea like mountains | Ar-Rahman 55:24 |
| Eyes and tongue | ﴿ألم نجعل له عينين * ولساناً وشفتين﴾ | Did We not give him two eyes, a tongue and two lips? | Al-Balad 90:8–9 |
| Speech and writing | ﴿خلق الإنسان * علّمه البيان﴾ | He created man and taught him clear expression | Ar-Rahman 55:3–4 |
| Sleep | ﴿وجعلنا نومكم سباتاً﴾ | We made your sleep for rest | An-Naba 78:9 |
| Night and day | ﴿وجعلنا الليل لباساً * وجعلنا النهار معاشاً﴾ | We made the night a covering and the day for livelihood | An-Naba 78:10–11 |
| Mountains | ﴿والجبال أوتاداً﴾ | And the mountains as pegs | An-Naba 78:7 |
| Clothing | ﴿يا بني آدم قد أنزلنا عليكم لباساً يواري سوآتكم وريشاً﴾ | We have given you clothing to cover you and for adornment | Al-A'raf 7:26 |
| Livestock | ﴿والأنعام خلقها لكم فيها دفء ومنافع﴾ | He created livestock for you, with warmth and benefits | An-Nahl 16:5 |
| Home | ﴿والله جعل لكم من بيوتكم سكناً﴾ | Allah made your homes a place of rest | An-Nahl 16:80 |
| Crops and grain | ﴿والحب ذو العصف والريحان﴾ | Grain with husks, and fragrant plants | Ar-Rahman 55:12 |
| Family | ﴿والله جعل لكم من أنفسكم أزواجاً وجعل لكم من أزواجكم بنين وحفدة﴾ | He gave you spouses, and from them children and grandchildren | An-Nahl 16:72 |
| Everything (abstention) | ﴿وإن تعدوا نعمة الله لا تحصوها﴾ | If you tried to count Allah's blessings, you could not | Ibrahim 14:34 / An-Nahl 16:18 |

**Supporting hadith (sahih):**
- «نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ» — Bukhari 6412
- «انظروا إلى من أسفل منكم، ولا تنظروا إلى من هو فوقكم، فهو أجدر أن لا تزدروا نعمة الله عليكم» — Muslim 2963
- «عجباً لأمر المؤمن، إن أمره كله خير... إن أصابته سرّاء شكر فكان خيراً له» — Muslim 2999

Hadith text is copied from the source collection when entered into `blessings.json`, with number, grade and who graded it.

## 10. Privacy

- Photos are analyzed then discarded: never stored, never logged.
- Downscaled on-device (max edge 768px) before upload.
- No account, no tracking; anonymous analytics only (Plausible or Umami).
- Learning stage is user-chosen and stays on the device; no religious or sensitive attribute is ever inferred from photos or behavior.
- User testing: any background data is self-reported with explicit consent; results published aggregated and anonymous.

## 11. Success metrics and measurement plan

| Metric | Method | Target |
|---|---|---|
| Recognition accuracy | 100 test images, **3 runs**, including out-of-list and ambiguous images | ≥ 85% correct or correctly abstained; ≥ 90% consistency across runs |
| Advantage of chosen approach | Same images through alternative 2 (generic classifier + manual mapping) | Clear improvement in correct matches and correct abstentions |
| Unverified religious text shown | Guard tests | **0%** |
| Capture-to-card time | Measured on the demo | < 4 s |
| **Benefit per track criterion** | 8–10 users. **Alaa group:** 5 min with the app. **Comparison group:** same verses in a regular mushaf app. Same questions afterwards | Alaa group better at linking a blessing to its verse and explaining the refrain |
| Journey continuity | Share completing ≥ 3 stations during testing | ≥ 60% |
| Cost per photo | Measured from API billing | Documented figure in the presentation |
| Changes from testing | "Observed → changed" log | At least 2 documented improvements |

## 12. Delivery plan

**Working hours:** Oct 4–5, 09:00–22:00; Oct 6, 09:00–23:59 (Riyadh time = Qatar time).

### Before 09:00, Oct 4
- Commit "Baseline", tag `baseline`, with `BASELINE.md`.

### Day 1 (Oct 4): The Lens
- Next.js + PWA + RTL + i18n (ar/en).
- **First deploy to Vercel before noon; open a placeholder submission on the platform.**
- `/api/see` with enum output, tested on 30 images.
- Blessing card + Source Guard (four level gates) + tests.
- Sample photos in the lens.
- Mentoring: technical session on constrained output design.

### Day 2 (Oct 5): Journey and testing
- "My Day's Surah" + share card.
- "Ar-Rahman Journey" + after-journey screen + learning stage.
- Religious review of the 25 cards (reviewer or religious mentoring session), documented.
- User testing with a comparison group.
- Mentoring: user-experience session.

### Day 3 (Oct 6): Measurement and submission
- Fixes from user testing, documented.
- Evaluation ×3 + alternative-approach run + cost measurement.
- Video (≤ 2 min), presentation, source documentation.
- Test the live link and every feature from another device and network.
- Final submission before **23:59**; keep the confirmation message.

## 13. Deliverables checklist (per the participant guide)

- [ ] **Fully working solution**, not a prototype (Vercel link)
- [ ] **Live demo link**, every feature tested, available through the end of final judging (Oct 22)
- [ ] **Public GitHub repo** containing:
  - All code we have the right to publish, with component licenses and owners' rights
  - `README.md`: idea, setup, running, dependencies
  - `.env.example` with no keys, passwords or user data
  - `docs/SOURCES.md`: source, tool (including AI tools used in development) and license log
  - `docs/METHODOLOGY.md`, `docs/RESULTS.md`, `sources/REVIEW_LOG.md`, `BASELINE.md`
  - Evaluation script and results so judges can re-run tests
- [ ] **Video ≤ 2 minutes**
- [ ] **PDF or PowerPoint presentation** (Arabic or English, official template or own template respecting the challenge identity) with:
  - Problem, solution, how it works, value-add, technologies
  - **Screenshots of the project**
  - **Detailed AI explanation:** components, how it works, how it is used, its limits
  - Results (with baseline comparison) and continuation plan
  - A **"Built during the challenge / Planned"** slide
  - **Designed for a 5-minute talk:** the same file is used in the final Zoom session

## 14. Map to final judging criteria

(The acceptance score does not carry into the final result.)

| Criterion | Weight | Evidence we provide |
|---|---|---|
| Technical quality & AI use | 25% | Stable demo, 3-run results, comparison with alternative, documented method and limits |
| Benefit per track success criterion | 20% | User test with comparison group; journey continuity rate |
| Reliability & scholarly safety | 15% | Four level gates, critical-case tests, `REVIEW_LOG.md`, abstention and referral |
| Innovation & value-add | 15% | Direct comparison with gratitude apps and a regular mushaf app |
| User experience, communication, accessibility | 10% | Two languages, stage personalization, accessibility, errors with next steps, change log |
| Operational realism | 10% | Measured cost, fallback provider, maintenance and content-review plan (§16) |
| Clarity & verifiability | 5% | quran.com verification links, re-runnable eval, built vs planned separated |

### Accessibility
- Alt text for every image; buttons with clear accessible names.
- Sufficient color contrast (gold on "Layl" navy to be checked).
- Text scaling without breaking layout.
- Error messages explain what happened and what to do next (e.g. "Camera unavailable: upload a photo or try a sample").

## 15. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Misrecognition | Thresholds + "Is this...?" + abstention |
| Forced verse links | Manual, reviewed mapping; no miracle claims |
| Religious review delayed | Cards run on text + translation with "under review" badge; reflections hidden |
| Judge has no camera | Bundled sample photos |
| Daily limit blocks judges | Raised demo limit, budget through Oct 22, cached sample results |
| Free-tier idling | Vercel pages don't idle; periodic link checks during judging |
| Vision provider outage | Fallback provider behind `VisionProvider` |
| API cost | Downscaling, caching, daily limit |
| Camera denied on iOS | Gallery upload always available |
| Translation licensing | Arabic + English first with a documented licensed translation; Norwegian after verification |

## 16. Operational realism and sustainability

- **Cost:** per-photo cost measured on Day 3, with monthly estimates for 1,000 and 10,000 users.
- **Critical dependencies and fallbacks:** vision provider (fallback behind `VisionProvider`, later on-device Vision); hosting (any Next.js host).
- **Content review:** every change to `blessings.json` goes through a Pull Request, merged only with the religious reviewer's approval and a `REVIEW_LOG.md` entry.
- **Maintenance:** Ibrahim owns the code; the religious reviewer owns the content.
- **Community:** open-source database; the Itqan community can contribute via Pull Requests.
- **`sanad-core`** shared with Mizan: Source Guard, source registry, source-card component.
- **Later:** Norwegian once licensed; native SwiftUI version with on-device Vision for lower cost and better privacy.
