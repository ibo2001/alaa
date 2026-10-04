/**
 * Builds the print-ready user testing sheets (A4 PDF, Arabic and English) from the text in
 * docs/user-testing/PARTICIPANT_SHEET.{ar,en}.md. Page 1: consent (before the session).
 * Page 2: questions (handed over after the 5 minutes). The ID goes on both pages; the group never does.
 *
 *   npx tsx scripts/participant-sheets.ts
 */
import { chromium } from "@playwright/test";

type Sheet = {
  lang: "ar" | "en";
  dir: "rtl" | "ltr";
  font: string;
  title: string;
  id: string;
  date: string;
  page1: string;
  page2: string;
  intro: string;
  points: string[];
  agree: string;
  yes: string;
  familiarity: string;
  familiarityOptions: string[];
  questionsTitle: string;
  questionsHint: string;
  questions: { text: string; lines: number }[];
  scale: { text: string; low: string; high: string }[];
  open: string[];
  thanks: string;
  digits: (n: number) => string;
};

const arDigits = (n: number) => new Intl.NumberFormat("ar-EG").format(n);

const SHEETS: Sheet[] = [
  {
    lang: "en",
    dir: "ltr",
    font: "IBM Plex Sans",
    title: "Alaa · Participant sheet",
    id: "ID",
    date: "Date",
    page1: "Before the session",
    page2: "After the session",
    intro: "Thank you for helping. You will spend about 5 minutes with an app or a website, then answer a few short questions. It takes about 12 minutes in total.",
    points: [
      "This tests the app, not you. There are no wrong answers.",
      "We don't write down your name. We don't take photos, audio or video of you.",
      "You can stop at any time, without giving a reason.",
      "Answers are published only as combined, anonymous results.",
    ],
    agree: "Do you agree to take part?",
    yes: "Yes",
    familiarity: "Optional: how well do you know the Quran?",
    familiarityOptions: ["I'm new to the Quran", "I know the Quran", "Prefer not to say"],
    questionsTitle: "Questions",
    questionsHint: "Answer in your own words. “I don't know” is a fine answer.",
    questions: [
      { text: "Where in the Quran is <b>water we drink</b> mentioned, and what does the verse say about it?", lines: 2 },
      { text: "Where in the Quran are <b>dates and palm trees</b> mentioned, and what does the verse say about them?", lines: 2 },
      { text: "Where in the Quran is <b>the sky</b> mentioned, and what does the verse say about it?", lines: 2 },
      { text: "In Surah Ar-Rahman, one ayah is repeated many times. What does it mean, in your own words?", lines: 3 },
      { text: "Name one other everyday thing that you think the Quran draws attention to.", lines: 1 },
    ],
    scale: [
      { text: "“I would like to use this again tomorrow.”", low: "Strongly disagree", high: "Strongly agree" },
      { text: "“It felt like being preached to.”", low: "Strongly disagree", high: "Strongly agree" },
    ],
    open: ["What, if anything, confused you?", "What one thing would you change?"],
    thanks: "Thank you.",
    digits: String,
  },
  {
    lang: "ar",
    dir: "rtl",
    font: "IBM Plex Sans Arabic",
    title: "آلاء · ورقة المشارك",
    id: "الرقم",
    date: "التاريخ",
    page1: "قبل الجلسة",
    page2: "بعد الجلسة",
    intro: "شكراً لمساعدتك. ستقضي نحو خمس دقائق مع تطبيق أو موقع، ثم تجيب عن أسئلة قصيرة. يستغرق الأمر كله نحو اثنتي عشرة دقيقة.",
    points: [
      "نحن نختبر التطبيق، لا نختبرك. لا توجد إجابة خاطئة.",
      "لا نكتب اسمك، ولا نلتقط لك صوراً، ولا نسجّل صوتاً أو فيديو.",
      "يمكنك التوقف في أي وقت، دون ذكر السبب.",
      "لا تُنشر الإجابات إلا نتائجَ مجمّعة دون أسماء.",
    ],
    agree: "هل توافق على المشاركة؟",
    yes: "نعم",
    familiarity: "اختياري: ما مدى معرفتك بالقرآن؟",
    familiarityOptions: ["أنا جديد على القرآن", "أعرف القرآن", "أفضّل عدم الإجابة"],
    questionsTitle: "الأسئلة",
    questionsHint: "أجب بكلماتك. «لا أعرف» إجابة مقبولة.",
    questions: [
      { text: "أين ذُكر <b>الماء الذي نشربه</b> في القرآن، وماذا تقول الآية عنه؟", lines: 2 },
      { text: "أين ذُكر <b>التمر والنخل</b> في القرآن، وماذا تقول الآية عنهما؟", lines: 2 },
      { text: "أين ذُكرت <b>السماء</b> في القرآن، وماذا تقول الآية عنها؟", lines: 2 },
      { text: "في سورة الرحمن آيةٌ تتكرّر مرات كثيرة. ما معناها، بكلماتك؟", lines: 3 },
      { text: "اذكر شيئاً آخر من حياتك اليومية ترى أن القرآن يلفت الانتباه إليه.", lines: 1 },
    ],
    scale: [
      { text: "«أودّ أن أستخدم هذا مرة أخرى غداً.»", low: "لا أوافق بشدة", high: "أوافق بشدة" },
      { text: "«شعرت كأن أحداً يعظني.»", low: "لا أوافق بشدة", high: "أوافق بشدة" },
    ],
    open: ["ما الذي أربكك، إن وُجد؟", "ما الشيء الواحد الذي تودّ تغييره؟"],
    thanks: "شكراً لك.",
    digits: arDigits,
  },
];

const box = `<span class="box"></span>`;
const lines = (n: number) => Array.from({ length: n }, () => `<div class="line"></div>`).join("");

function html(s: Sheet): string {
  const q = (n: number) => `${s.lang === "ar" ? "س" : "Q"}${s.digits(n)}.`;
  const head = (page: string) => `
    <header>
      <div><h1>${s.title}</h1><p class="page">${page}</p></div>
      <div class="fields"><p>${s.id}: <span class="blank"></span></p><p>${s.date}: <span class="blank"></span></p></div>
    </header>`;
  let n = 0;
  const questions = s.questions.map((x) => `<div class="q"><p><b>${q(++n)}</b> ${x.text}</p>${lines(x.lines)}</div>`).join("");
  const scale = s.scale
    .map(
      (x) => `<div class="q"><p><b>${q(++n)}</b> ${x.text}</p>
      <div class="scale"><span class="end">${x.low}</span>${[1, 2, 3, 4, 5].map((v) => `<span class="opt">${box} ${s.digits(v)}</span>`).join("")}<span class="end">${x.high}</span></div></div>`,
    )
    .join("");
  const open = s.open.map((x) => `<div class="q"><p><b>${q(++n)}</b> ${x}</p>${lines(2)}</div>`).join("");

  return `<!doctype html><html lang="${s.lang}" dir="${s.dir}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${s.font.replace(/ /g, "+")}:wght@400;600;700&family=Aref+Ruqaa:wght@700&display=swap">
<style>
  @page { size: A4; margin: 16mm 18mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: '${s.font}', sans-serif; color: #1B2340; font-size: 11pt; line-height: 1.5; }
  section { page-break-after: always; }
  section:last-child { page-break-after: auto; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E6C478; padding-bottom: 8px; margin-bottom: 12px; }
  h1 { font-size: 18pt; margin: 0; }
  h2 { font-size: 14pt; margin: 18px 0 6px; }
  .page { margin: 0; color: #7A3B1D; font-weight: 600; }
  .fields p { margin: 0 0 6px; }
  .blank { display: inline-block; width: 38mm; border-bottom: 1px solid #1B2340; height: 1.1em; vertical-align: bottom; }
  ul { padding-inline-start: 20px; }
  li { margin-bottom: 4px; }
  .box { display: inline-block; width: 4.2mm; height: 4.2mm; border: 1.5px solid #1B2340; border-radius: 1mm; vertical-align: -0.6mm; }
  .choice { margin: 10px 0; display: flex; gap: 18px; flex-wrap: wrap; align-items: center; }
  .q { margin-bottom: 9px; break-inside: avoid; }
  .q p { margin: 0 0 4px; }
  .line { border-bottom: 1px solid #AEB8CC; height: 7mm; }
  .scale { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .end { font-size: 9.5pt; color: #3A4560; }
  .thanks { margin-top: 14px; font-weight: 600; }
</style></head><body>
<section>
  ${head(s.page1)}
  <p>${s.intro}</p>
  <ul>${s.points.map((p) => `<li>${p}</li>`).join("")}</ul>
  <p class="choice"><b>${s.agree}</b> <span>${box} ${s.yes}</span></p>
  <p class="choice"><span>${s.familiarity}</span></p>
  <p class="choice">${s.familiarityOptions.map((o) => `<span>${box} ${o}</span>`).join("")}</p>
</section>
<section>
  ${head(s.page2)}
  <h2>${s.questionsTitle}</h2>
  <p>${s.questionsHint}</p>
  ${questions}${scale}${open}
  <p class="thanks">${s.thanks}</p>
</section>
</body></html>`;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const s of SHEETS) {
    await page.setContent(html(s), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const path = `docs/user-testing/participant-sheet.${s.lang}.pdf`;
    await page.pdf({ path, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log(`wrote ${path}`);
  }
  await browser.close();
}

if (process.argv.includes("--measure")) {
  void (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 658, height: 1000 } }); // 174mm content width at 96dpi
    for (const s of SHEETS) {
      await page.setContent(html(s), { waitUntil: "networkidle" });
      await page.emulateMedia({ media: "print" });
      const mm = await page.evaluate(() => [...document.querySelectorAll("section")].map((el) => Math.round(el.getBoundingClientRect().height / 3.78)));
      console.log(s.lang, "section heights (mm, page body is 265):", mm);
      if (process.env.SHOT_DIR) {
        const els = await page.locator("section").all();
        for (const [i, el] of els.entries()) await el.screenshot({ path: `${process.env.SHOT_DIR}/sheet-${s.lang}-${i + 1}.png` });
      }
    }
    await browser.close();
  })();
} else {
  void main();
}
