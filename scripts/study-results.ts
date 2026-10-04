/**
 * Fetches the user-testing responses from both Google Forms (docs/user-testing/forms.json) and prepares
 * blind scoring. Everything it writes goes to user-testing-private/ (git-ignored): responses are never committed.
 *
 *   npx tsx scripts/study-results.ts fetch       → responses.json, scoring.csv (no group), key.csv (group etc.)
 *   npx tsx scripts/study-results.ts summarize   → reads the filled-in scores from scoring.csv and prints the
 *                                                   summary table for docs/user-testing/RESULTS.md
 *
 * Scoring (docs/user-testing/PROTOCOL.md): fill S1–S4 with 0/1/2 and S5 with 0/1 in scoring.csv. The rows are
 * shuffled and carry no group, so the scorer can't tell who used which tool.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DIR = "user-testing-private";
const forms = JSON.parse(readFileSync("docs/user-testing/forms.json", "utf8")) as Record<string, { formId: string }>;

type Item = { title?: string; questionItem?: { question: { questionId: string } } };
type Response = { responseId: string; createTime: string; answers?: Record<string, { textAnswers?: { answers: { value: string }[] } }> };

function gws(args: string[]): unknown {
  const out = execFileSync("gws", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  return JSON.parse(out.slice(out.indexOf("{")));
}

const csvCell = (v: string | number | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csv = (rows: (string | number | undefined)[][]) => rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** Answers in form order: [consent, code, familiarity, stations, ready(A), ready(B), Q1..Q5, Q6, Q7, Q8, Q9, time, looked]. */
function fetchAll() {
  const out: { lang: string; answers: string[] }[] = [];
  for (const [lang, { formId }] of Object.entries(forms)) {
    const form = gws(["forms", "forms", "get", "--params", JSON.stringify({ formId })]) as { items: Item[] };
    const questionIds = form.items.filter((i) => i.questionItem).map((i) => i.questionItem!.question.questionId);
    const res = gws(["forms", "forms", "responses", "list", "--params", JSON.stringify({ formId })]) as { responses?: Response[] };
    for (const r of res.responses ?? []) {
      out.push({ lang, answers: questionIds.map((q) => r.answers?.[q]?.textAnswers?.answers.map((a) => a.value).join("; ") ?? "") });
    }
  }
  return out;
}

function fetchCommand() {
  mkdirSync(DIR, { recursive: true });
  const all = fetchAll().filter((r) => r.answers[1] === "A" || r.answers[1] === "B"); // consented and coded
  writeFileSync(`${DIR}/responses.json`, JSON.stringify(all, null, 2));

  // Shuffle, then number: R01, R02, … The group lives only in key.csv.
  const shuffled = all.map((r) => ({ r, k: Math.random() })).sort((a, b) => a.k - b.k).map((x) => x.r);
  const scoring: (string | number)[][] = [["id", "lang", "Q1", "Q2", "Q3", "Q4", "Q5", "S1", "S2", "S3", "S4", "S5"]];
  const key: (string | number)[][] = [["id", "group", "familiarity", "stations", "Q6 again", "Q7 preachy", "Q8 confused", "Q9 change", "time", "looked again"]];
  shuffled.forEach((r, i) => {
    const id = `R${String(i + 1).padStart(2, "0")}`;
    const a = r.answers;
    scoring.push([id, r.lang, a[6]!, a[7]!, a[8]!, a[9]!, a[10]!, "", "", "", "", ""]);
    key.push([id, a[1]!, a[2]!, a[3]!, a[11]!, a[12]!, a[13]!, a[14]!, a[15]!, a[16]!]);
  });
  writeFileSync(`${DIR}/scoring.csv`, csv(scoring));
  writeFileSync(`${DIR}/key.csv`, csv(key));
  console.log(`${all.length} responses → ${DIR}/scoring.csv (score this, blind) and ${DIR}/key.csv`);
}

function summarizeCommand() {
  const scores = parseCsv(readFileSync(`${DIR}/scoring.csv`, "utf8")).slice(1);
  const keys = new Map(parseCsv(readFileSync(`${DIR}/key.csv`, "utf8")).slice(1).map((r) => [r[0]!, r]));
  const groups = { A: [] as number[][], B: [] as number[][] };
  for (const s of scores) {
    const k = keys.get(s[0]!);
    if (!k) continue;
    const n = (v: string | undefined) => (v === undefined || v === "" ? NaN : Number(v));
    // [linking 0–6, refrain 0–2, Q5 0–1, again 1–5, preachy 1–5, stations, flagged]
    const flagged = /^(Yes|نعم)/.test(k[9] ?? "") || /^(Less|أقل)/.test(k[8] ?? "") ? 1 : 0;
    groups[k[1] as "A" | "B"]?.push([n(s[7]) + n(s[8]) + n(s[9]), n(s[10]), n(s[11]), n(k[4]), n(k[5]), n(k[3]), flagged]);
  }
  const mean = (rows: number[][], i: number) => {
    const v = rows.map((r) => r[i]!).filter((x) => !Number.isNaN(x));
    return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : "–";
  };
  const share = (rows: number[][], i: number, test: (x: number) => boolean) => {
    const v = rows.map((r) => r[i]!).filter((x) => !Number.isNaN(x));
    return v.length ? `${Math.round((v.filter(test).length / v.length) * 100)}% (${v.filter(test).length}/${v.length})` : "–";
  };
  const { A, B } = groups;
  console.log(`| Measure | Group A (Alaa) | Group B (quran.com) |
|---|---|---|
| Participants | ${A.length} | ${B.length} |
| Linking score, mean (0–6) | ${mean(A, 0)} | ${mean(B, 0)} |
| Refrain score, mean (0–2) | ${mean(A, 1)} | ${mean(B, 1)} |
| Another blessing named (Q5), share | ${share(A, 2, (x) => x >= 1)} | ${share(B, 2, (x) => x >= 1)} |
| Use again, mean (1–5) | ${mean(A, 3)} | ${mean(B, 3)} |
| Felt preached to, mean (1–5) | ${mean(A, 4)} | ${mean(B, 4)} |
| Completed ≥ 3 journey stations | ${share(A, 5, (x) => x >= 3)} | — |
| Flagged (looked again or < 3 min) | ${A.filter((r) => r[6]).length} | ${B.filter((r) => r[6]).length} |`);
}

const cmd = process.argv[2];
if (cmd === "fetch") fetchCommand();
else if (cmd === "summarize") summarizeCommand();
else console.log("usage: npx tsx scripts/study-results.ts fetch|summarize");
