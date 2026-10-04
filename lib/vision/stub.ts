import samples from "@/public/samples/samples.json";
import type { VisionProvider, VisionResult } from "./types";

/**
 * Offline provider for tests and emergencies. It does not look at the image:
 * for a bundled sample photo it returns that sample's labeled concept, otherwise "none".
 */
export class StubVisionProvider implements VisionProvider {
  readonly name = "stub";

  async recognize(_image: unknown, opts?: { sampleId?: string }): Promise<VisionResult> {
    const sample = samples.samples.find((s) => s.id === opts?.sampleId);
    if (!sample) return { candidates: [{ concept: "none", confidence: 0.9 }], is_person: false, unsafe: false };
    return { candidates: [{ concept: sample.concept, confidence: 0.9 }], is_person: false, unsafe: false };
  }
}
