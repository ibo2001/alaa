import { z } from "zod";
import { concepts, recognizableConceptIds } from "@/lib/sources/data";
import type { VisionResult } from "./types";

export const TOOL_NAME = "report_concepts";

/** JSON schema for the tool input: concept ids are a closed enum. */
export function toolInputSchema(ids: string[] = recognizableConceptIds) {
  return {
    type: "object" as const,
    properties: {
      candidates: {
        type: "array",
        description: "Up to 3 concepts visible in the photo, most likely first.",
        items: {
          type: "object",
          properties: {
            concept: { type: "string", enum: ids },
            confidence: { type: "number", description: "0 to 1" },
          },
          required: ["concept", "confidence"],
          additionalProperties: false,
        },
      },
      is_person: { type: "boolean", description: "True if a person or part of a person is the main subject." },
      unsafe: { type: "boolean", description: "True if the image is inappropriate (violence, nudity, gore, etc.)." },
    },
    required: ["candidates", "is_person", "unsafe"],
    additionalProperties: false,
  };
}

const ids = new Set(recognizableConceptIds);

/** Validates provider output again on our side; anything outside the enum is dropped. */
export const visionResultSchema = z.object({
  candidates: z
    .array(z.object({ concept: z.string(), confidence: z.number() }))
    .transform((cs) =>
      cs
        .filter((c) => ids.has(c.concept))
        .map((c) => ({ concept: c.concept, confidence: Math.min(1, Math.max(0, c.confidence)) }))
        .slice(0, 3),
    ),
  is_person: z.boolean(),
  unsafe: z.boolean(),
});

export function parseVisionResult(input: unknown): VisionResult {
  return visionResultSchema.parse(input);
}

/** Concept list given to the model, with aliases to help recognition. */
export function conceptGlossary(): string {
  return concepts
    .filter((c) => c.recognizable !== false)
    .map((c) => `- ${c.id}: ${c.labels.en}${c.aliases?.length ? ` (${c.aliases.join(", ")})` : ""}`)
    .join("\n");
}
