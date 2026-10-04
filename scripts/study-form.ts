/**
 * Creates the remote user-testing form (docs/user-testing/FORM.md) in Google Forms with the `gws` CLI,
 * one form per language, then prints the pre-filled A and B links. Needs `gws auth login` (forms.body scope).
 *
 *   npx tsx scripts/study-form.ts en|ar
 *
 * Writes the form id and links to docs/user-testing/forms.json. Responses stay in Google Forms; they are
 * fetched for scoring by scripts/study-results.ts and never committed.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

type Lang = "en" | "ar";

const T = {
  en: {
    title: "Alaa · a short study (about 12 minutes)",
    welcome:
      "Thank you for helping. You will spend about 5 minutes with an app or a website, then answer a few short questions.\n\n• This tests the app, not you. There are no wrong answers.\n• We don't ask for your name or email.\n• You can stop at any time, without giving a reason.\n• Answers are published only as combined, anonymous results.",
    agree: "Do you agree to take part?",
    agreeYes: "Yes, I agree",
    agreeNo: "No",
    aboutTitle: "About you",
    code: "Session code",
    codeHelp: "Already filled in from your link. Please don't change it.",
    familiarity: "Optional: how well do you know the Quran?",
    familiarityOptions: ["I'm new to the Quran", "I know the Quran", "Prefer not to say"],
    aTitle: "Your 5 minutes (app)",
    aBody:
      "1. On your phone, open https://alaa-alpha.vercel.app (Arabic or English, as you like).\n2. Try it on a glass of water, dates and the sky: real objects around you, or the sample photos in the lens.\n3. Add what you like to “My Day”.\n4. Open the “Journey” and go as far as you like.\n\nSpend about 5 minutes. Before you close the app, open the Journey screen once more.",
    stations: "The Journey screen says “… of 7 stations”. What is the number?",
    aReady: "Now close the app, and please don't open it again while you answer.",
    ready: "I've closed it and I'm ready for the questions",
    bTitle: "Your 5 minutes (reading)",
    bBody:
      "Please read these four verses on quran.com, at your own pace, for about 5 minutes:\n\nhttps://quran.com/56/68-70\nhttps://quran.com/55/11\nhttps://quran.com/55/7\nhttps://quran.com/55/13",
    bReady: "Then close the page, and please don't open it again while you answer.",
    qTitle: "Questions",
    qHelp: "Answer in your own words. “I don't know” is a fine answer.",
    q: [
      "Where in the Quran is water we drink mentioned, and what does the verse say about it?",
      "Where in the Quran are dates and palm trees mentioned, and what does the verse say about them?",
      "Where in the Quran is the sky mentioned, and what does the verse say about it?",
      "In Surah Ar-Rahman, one ayah is repeated many times. What does it mean, in your own words?",
      "Name one other everyday thing that you think the Quran draws attention to.",
    ],
    scale: ["“I would like to use this again tomorrow.”", "“It felt like being preached to.”"],
    scaleLow: "Strongly disagree",
    scaleHigh: "Strongly agree",
    open: ["What, if anything, confused you?", "What one thing would you change?"],
    time: "About how long did you spend with the app or website?",
    timeOptions: ["Less than 3 minutes", "3–7 minutes", "More than 7 minutes"],
    looked: "Did you look at the app or website again while answering?",
    lookedOptions: ["No", "Yes (that's fine, please just tell us)"],
    thanks: "Thank you. Your answers help make Alaa better.",
  },
  ar: {
    title: "آلاء · دراسة قصيرة (نحو ١٢ دقيقة)",
    welcome:
      "شكراً لمساعدتك. ستقضي نحو خمس دقائق مع تطبيق أو موقع، ثم تجيب عن أسئلة قصيرة.\n\n• نحن نختبر التطبيق، لا نختبرك. لا توجد إجابة خاطئة.\n• لا نسألك عن اسمك ولا بريدك.\n• يمكنك التوقف في أي وقت، دون ذكر السبب.\n• لا تُنشر الإجابات إلا نتائجَ مجمّعة دون أسماء.",
    agree: "هل توافق على المشاركة؟",
    agreeYes: "نعم، أوافق",
    agreeNo: "لا",
    aboutTitle: "عنك",
    code: "رمز الجلسة",
    codeHelp: "مُعبّأ مسبقاً من رابطك. نرجو عدم تغييره.",
    familiarity: "اختياري: ما مدى معرفتك بالقرآن؟",
    familiarityOptions: ["أنا جديد على القرآن", "أعرف القرآن", "أفضّل عدم الإجابة"],
    aTitle: "دقائقك الخمس (التطبيق)",
    aBody:
      "١. افتح على جوالك https://alaa-alpha.vercel.app (بالعربية أو الإنجليزية، كما تحب).\n٢. جرّبه على كوب ماء وتمر والسماء: أشياء حقيقية حولك، أو الصور الجاهزة في العدسة.\n٣. أضف ما تحب إلى «يومي».\n٤. افتح «الرحلة» وامضِ فيها إلى حيث تشاء.\n\nاقضِ نحو خمس دقائق. وقبل أن تغلق التطبيق، افتح شاشة الرحلة مرة أخرى.",
    stations: "تقول شاشة الرحلة «… من ٧ محطات». ما الرقم؟",
    aReady: "أغلق التطبيق الآن، ونرجو ألا تفتحه مرة أخرى أثناء الإجابة.",
    ready: "أغلقته وأنا مستعد للأسئلة",
    bTitle: "دقائقك الخمس (القراءة)",
    bBody:
      "نرجو أن تقرأ هذه الآيات الأربع على موقع quran.com، على مهلك، لنحو خمس دقائق:\n\nhttps://quran.com/56/68-70\nhttps://quran.com/55/11\nhttps://quran.com/55/7\nhttps://quran.com/55/13",
    bReady: "ثم أغلق الصفحة، ونرجو ألا تفتحها مرة أخرى أثناء الإجابة.",
    qTitle: "الأسئلة",
    qHelp: "أجب بكلماتك. «لا أعرف» إجابة مقبولة.",
    q: [
      "أين ذُكر الماء الذي نشربه في القرآن، وماذا تقول الآية عنه؟",
      "أين ذُكر التمر والنخل في القرآن، وماذا تقول الآية عنهما؟",
      "أين ذُكرت السماء في القرآن، وماذا تقول الآية عنها؟",
      "في سورة الرحمن آيةٌ تتكرّر مرات كثيرة. ما معناها، بكلماتك؟",
      "اذكر شيئاً آخر من حياتك اليومية ترى أن القرآن يلفت الانتباه إليه.",
    ],
    scale: ["«أودّ أن أستخدم هذا مرة أخرى غداً.»", "«شعرت كأن أحداً يعظني.»"],
    scaleLow: "لا أوافق بشدة",
    scaleHigh: "أوافق بشدة",
    open: ["ما الذي أربكك، إن وُجد؟", "ما الشيء الواحد الذي تودّ تغييره؟"],
    time: "كم من الوقت قضيت تقريباً مع التطبيق أو الموقع؟",
    timeOptions: ["أقل من ٣ دقائق", "من ٣ إلى ٧ دقائق", "أكثر من ٧ دقائق"],
    looked: "هل نظرت إلى التطبيق أو الموقع مرة أخرى أثناء الإجابة؟",
    lookedOptions: ["لا", "نعم (لا بأس، فقط أخبرنا)"],
    thanks: "شكراً لك. إجاباتك تساعد على تحسين آلاء.",
  },
} as const;

// Placeholders for the sections a question can jump to; replaced by Google's item ids in the second pass.
const ID = { aSection: "@A", bSection: "@B", qSection: "@Q" } as const;
const CODE_TITLE = "@code";

function gws(args: string[]): unknown {
  const out = execFileSync("gws", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  return JSON.parse(out.slice(out.indexOf("{")));
}

const section = (key: string | null, title: string, description?: string) => ({ ...(key ? { key } : {}), title, ...(description ? { description } : {}), pageBreakItem: {} });
const radio = (title: string, options: { value: string; goToSectionId?: string; goToAction?: string }[], required: boolean, extra: object = {}) => ({
  title,
  questionItem: { question: { required, choiceQuestion: { type: "RADIO", options }, ...extra } },
});
const textQ = (title: string, paragraph: boolean, required = false) => ({ title, questionItem: { question: { required, textQuestion: { paragraph } } } });
const scaleQ = (title: string, low: string, high: string) => ({
  title,
  questionItem: { question: { required: false, scaleQuestion: { low: 1, high: 5, lowLabel: low, highLabel: high } } },
});

function items(lang: Lang) {
  const t = T[lang];
  return [
    // Section 1: consent. "No" ends the form.
    radio(t.agree, [{ value: t.agreeYes, goToAction: "NEXT_SECTION" }, { value: t.agreeNo, goToAction: "SUBMIT_FORM" }], true),
    // Section 2: session code (branches A/B) and optional familiarity.
    section(null, t.aboutTitle),
    { ...radio(t.code, [{ value: "A", goToSectionId: ID.aSection }, { value: "B", goToSectionId: ID.bSection }], true), description: t.codeHelp, key: CODE_TITLE },
    radio(t.familiarity, t.familiarityOptions.map((value) => ({ value })), false),
    // Section 3A: the app. Ends by jumping over 3B to the questions.
    section(ID.aSection, t.aTitle, t.aBody),
    textQ(t.stations, false),
    radio(t.aReady, [{ value: t.ready, goToSectionId: ID.qSection }], true),
    // Section 3B: reading on quran.com.
    section(ID.bSection, t.bTitle, t.bBody),
    radio(t.bReady, [{ value: t.ready, goToSectionId: ID.qSection }], true),
    // Section 4: the same questions for everyone.
    section(ID.qSection, t.qTitle, t.qHelp),
    ...t.q.map((q, i) => textQ(q, i < 4)),
    ...t.scale.map((q) => scaleQ(q, t.scaleLow, t.scaleHigh)),
    ...t.open.map((q) => textQ(q, true)),
    radio(t.time, t.timeOptions.map((value) => ({ value })), false),
    radio(t.looked, t.lookedOptions.map((value) => ({ value })), false),
  ];
}

/** Strips local keys and branching for the create pass: a question can only point at sections that already exist. */
function withoutBranching(item: ReturnType<typeof items>[number]) {
  const copy = JSON.parse(JSON.stringify(item));
  delete copy.key;
  const options = copy.questionItem?.question?.choiceQuestion?.options as { goToSectionId?: string }[] | undefined;
  options?.forEach((o) => delete o.goToSectionId);
  return copy;
}

function withoutKey(item: ReturnType<typeof items>[number]) {
  const copy = JSON.parse(JSON.stringify(item));
  delete copy.key;
  return copy;
}

function main() {
  const lang = process.argv[2] as Lang;
  if (lang !== "en" && lang !== "ar") throw new Error("usage: npx tsx scripts/study-form.ts en|ar");
  const t = T[lang];
  const all = items(lang);

  const created = gws(["forms", "forms", "create", "--json", JSON.stringify({ info: { title: t.title, documentTitle: `Alaa user testing (${lang})` } })]) as {
    formId: string;
    responderUri: string;
  };
  const formId = created.formId;

  gws([
    "forms", "forms", "batchUpdate", "--params", JSON.stringify({ formId }), "--json",
    JSON.stringify({
      requests: [
        { updateFormInfo: { info: { description: t.welcome }, updateMask: "description" } },
        { updateSettings: { settings: { emailCollectionType: "DO_NOT_COLLECT" }, updateMask: "emailCollectionType" } },
        ...all.map((item, index) => ({ createItem: { item: withoutBranching(item), location: { index } } })),
      ],
    }),
  ]);

  // Second pass: add the branching now that every section exists.
  const form = gws(["forms", "forms", "get", "--params", JSON.stringify({ formId })]) as {
    items: { itemId: string; questionItem?: { question: { questionId: string } } }[];
  };
  const idOfKey = (key: string) => form.items[all.findIndex((x) => "key" in x && x.key === key)]!.itemId;
  const resolve = (item: ReturnType<typeof items>[number]) => {
    const json = JSON.stringify(withoutKey(item)).replace(/"@[ABQ]"/g, (m) => JSON.stringify(idOfKey(m.slice(1, -1))));
    return JSON.parse(json);
  };
  const branched = all
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => JSON.stringify(item).includes("goToSectionId"));
  gws([
    "forms", "forms", "batchUpdate", "--params", JSON.stringify({ formId }), "--json",
    JSON.stringify({
      requests: branched.map(({ item, index }) => ({
        updateItem: {
          item: { ...resolve(item), itemId: form.items[index]!.itemId },
          location: { index },
          updateMask: "questionItem.question.choiceQuestion.options",
        },
      })),
    }),
  ]);

  gws([
    "forms", "forms", "setPublishSettings", "--params", JSON.stringify({ formId }), "--json",
    JSON.stringify({ publishSettings: { publishState: { isPublished: true, isAcceptingResponses: true } }, updateMask: "*" }),
  ]);

  const codeIndex = all.findIndex((x) => "key" in x && x.key === CODE_TITLE);
  const entry = parseInt(form.items[codeIndex]!.questionItem!.question.questionId, 16);
  const link = (code: "A" | "B") => `${created.responderUri}?usp=pp_url&entry.${entry}=${code}`;
  const file = "docs/user-testing/forms.json";
  const saved = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  saved[lang] = { formId, edit: `https://docs.google.com/forms/d/${formId}/edit`, linkA: link("A"), linkB: link("B") };
  writeFileSync(file, JSON.stringify(saved, null, 2) + "\n");
  console.log(JSON.stringify(saved[lang], null, 2));
}

main();
