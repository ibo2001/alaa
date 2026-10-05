/**
 * Alternative approach for the evaluation (SPEC §11, "generic classifier + manual mapping").
 * The same model names up to three objects in its own words (no closed list in the prompt); a fixed
 * table built from the concepts' ids, English labels and aliases then maps those names to concept ids.
 * Evaluation only: the app itself always uses the constrained call (lib/vision/anthropic.ts).
 */
import Anthropic from "@anthropic-ai/sdk";
import { concepts } from "../lib/sources/data";
import type { VisionImage, VisionResult } from "../lib/vision/types";

const TOOL = "report_objects";

const tool: Anthropic.Tool = {
  name: TOOL,
  description: "Report the main objects visible in the photo, in plain English.",
  input_schema: {
    type: "object",
    properties: {
      objects: {
        type: "array",
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "A short English noun phrase, e.g. 'glass of water'" },
            confidence: { type: "number", description: "0 to 1" },
          },
          required: ["name", "confidence"],
        },
      },
      is_person: { type: "boolean", description: "A person is the main subject" },
    },
    required: ["objects", "is_person"],
  },
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(?<=\w{3})(es|s)\b/g, ""); // naive plural folding: "dates" → "date"

// The manual mapping table: every known name for a concept, normalised.
const TABLE: { name: string; concept: string }[] = concepts
  .filter((c) => c.recognizable !== false)
  .flatMap((c) => [c.id.replace(/_/g, " "), c.labels.en, ...(c.aliases ?? [])].map((n) => ({ name: norm(n), concept: c.id })));

/** Exact name first, then a whole-word containment either way (longest table name wins). */
export function mapName(raw: string): string | null {
  const n = norm(raw);
  const exact = TABLE.find((t) => t.name === n);
  if (exact) return exact.concept;
  const contains = TABLE.filter((t) => new RegExp(`\\b${t.name}\\b`).test(n) || new RegExp(`\\b${n}\\b`).test(t.name)).sort(
    (a, b) => b.name.length - a.name.length,
  );
  return contains[0]?.concept ?? null;
}

export async function recognizeFreeLabels(client: Anthropic, model: string, image: VisionImage): Promise<VisionResult & { names: string[] }> {
  const response = await client.messages.create({
    model,
    max_tokens: 512,
    temperature: 0,
    tools: [tool],
    tool_choice: { type: "tool", name: TOOL },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data.toString("base64") } },
          { type: "text", text: `Call ${TOOL} with the main objects you see.` },
        ],
      },
    ],
  });
  const u = response.usage;
  const usage = { input: u.input_tokens, output: u.output_tokens, cacheWrite: u.cache_creation_input_tokens ?? 0, cacheRead: u.cache_read_input_tokens ?? 0 };
  if (response.stop_reason === "refusal") return { candidates: [], is_person: false, unsafe: true, usage, names: [] };
  const call = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  const input = (call?.input ?? { objects: [], is_person: false }) as { objects: { name: string; confidence: number }[]; is_person: boolean };
  const names = input.objects.map((o) => o.name);
  const candidates = input.objects
    .map((o) => ({ concept: mapName(o.name), confidence: Math.max(0, Math.min(1, o.confidence)) }))
    .filter((c): c is { concept: string; confidence: number } => c.concept !== null)
    // Two names can map to one concept ("palm tree", "palm fronds"): keep it once, at its highest confidence.
    .sort((a, b) => b.confidence - a.confidence)
    .filter((c, i, all) => all.findIndex((x) => x.concept === c.concept) === i);
  return { candidates, is_person: input.is_person, unsafe: false, usage, names };
}
