export type Candidate = { concept: string; confidence: number };

/** Raw output of a vision provider: concept ids from the closed enum only, never free text. */
export type VisionResult = {
  candidates: Candidate[];
  is_person: boolean;
  unsafe: boolean;
};

export type VisionImage = { data: Buffer; mediaType: "image/jpeg" | "image/png" | "image/webp" };

export interface VisionProvider {
  readonly name: string;
  /** `sampleId` is set when the image is one of the bundled sample photos (used by the stub provider only). */
  recognize(image: VisionImage, opts?: { sampleId?: string }): Promise<VisionResult>;
}

export class VisionUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "VisionUnavailableError";
  }
}
