/**
 * The religious reviewer's submissions inbox: a Google Form (in Ibrahim's account, via the `gws` CLI) that the
 * review sheet (/[locale]/review) posts to. Responses are private to the form owner and never committed.
 *
 *   npx tsx scripts/review-form.ts create   → creates the form, writes sources/review-form.json
 *   npx tsx scripts/review-form.ts fetch    → prints the submissions (for Ibrahim to act on)
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const CONFIG = "sources/review-form.json";
const FIELDS = ["name", "qualification", "consent", "review"] as const;
const TITLES: Record<(typeof FIELDS)[number], string> = {
  name: "Reviewer name",
  qualification: "Qualification",
  consent: "May Alaa publish the name and qualification in the review log?",
  review: "Review",
};

function gws(args: string[]): unknown {
  const out = execFileSync("gws", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  return JSON.parse(out.slice(out.indexOf("{")));
}

function create() {
  const created = gws([
    "forms", "forms", "create", "--json",
    JSON.stringify({ info: { title: "Alaa · religious review submissions", documentTitle: "Alaa review submissions" } }),
  ]) as { formId: string; responderUri: string };
  const formId = created.formId;
  gws([
    "forms", "forms", "batchUpdate", "--params", JSON.stringify({ formId }), "--json",
    JSON.stringify({
      requests: [
        { updateFormInfo: { info: { description: "Filled in by the Alaa review sheet. Not meant to be opened directly." }, updateMask: "description" } },
        { updateSettings: { settings: { emailCollectionType: "DO_NOT_COLLECT" }, updateMask: "emailCollectionType" } },
        ...FIELDS.map((f, index) => ({
          createItem: { item: { title: TITLES[f], questionItem: { question: { required: false, textQuestion: { paragraph: f === "review" } } } }, location: { index } },
        })),
      ],
    }),
  ]);
  gws([
    "forms", "forms", "setPublishSettings", "--params", JSON.stringify({ formId }), "--json",
    JSON.stringify({ publishSettings: { publishState: { isPublished: true, isAcceptingResponses: true } }, updateMask: "*" }),
  ]);
  const form = gws(["forms", "forms", "get", "--params", JSON.stringify({ formId })]) as {
    items: { questionItem: { question: { questionId: string } } }[];
  };
  const entries = Object.fromEntries(FIELDS.map((f, i) => [f, `entry.${parseInt(form.items[i]!.questionItem.question.questionId, 16)}`]));
  const config = {
    $comment: "Where the review sheet sends the reviewer's answers (a Google Form owned by Ibrahim). Not secret: anyone can submit, only Ibrahim can read.",
    formId,
    action: created.responderUri.replace(/\/viewform.*$/, "/formResponse"),
    entries,
  };
  writeFileSync(CONFIG, JSON.stringify(config, null, 2) + "\n");
  console.log(JSON.stringify(config, null, 2));
}

function fetchAll() {
  const { formId } = JSON.parse(readFileSync(CONFIG, "utf8")) as { formId: string };
  const form = gws(["forms", "forms", "get", "--params", JSON.stringify({ formId })]) as {
    items: { title: string; questionItem: { question: { questionId: string } } }[];
  };
  const res = gws(["forms", "forms", "responses", "list", "--params", JSON.stringify({ formId })]) as {
    responses?: { createTime: string; answers?: Record<string, { textAnswers?: { answers: { value: string }[] } }> }[];
  };
  for (const r of res.responses ?? []) {
    console.log(`\n=== ${r.createTime} ===`);
    for (const item of form.items) {
      const v = r.answers?.[item.questionItem.question.questionId]?.textAnswers?.answers.map((a) => a.value).join("; ");
      console.log(`${item.title}: ${v ?? ""}`);
    }
  }
  if (!res.responses?.length) console.log("No submissions yet.");
}

const cmd = process.argv[2];
if (cmd === "create") create();
else if (cmd === "fetch") fetchAll();
else console.log("usage: npx tsx scripts/review-form.ts create|fetch");
