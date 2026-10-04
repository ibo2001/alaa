import blessingsFile from "@/sources/blessings.json";
import conceptsFile from "@/sources/concepts.json";
import type { Blessing, BlessingsFile, Concept } from "@/lib/types";

export const data = blessingsFile as BlessingsFile;
export const blessings: Blessing[] = data.blessings;
export const concepts: Concept[] = conceptsFile.concepts as Concept[];

const conceptById = new Map(concepts.map((c) => [c.id, c]));
const blessingById = new Map(blessings.map((b) => [b.id, b]));
const blessingByConcept = new Map<string, Blessing>();
for (const b of blessings) {
  for (const c of [b.concept, ...(b.relatedConcepts ?? [])]) blessingByConcept.set(c, b);
}

export const getConcept = (id: string) => conceptById.get(id);
export const getBlessing = (id: string) => blessingById.get(id);
export const blessingForConcept = (conceptId: string) => blessingByConcept.get(conceptId);

/** Concept ids offered to the vision model (the closed enum). */
export const recognizableConceptIds: string[] = concepts
  .filter((c) => c.recognizable !== false)
  .map((c) => c.id);
