import { createHash } from "node:crypto";
import type { Passage } from "./passages";
import { tokenize } from "./text";

export interface Embedder {
  readonly model: string;
  embed(texts: string[], kind: "document" | "query"): Promise<Float32Array[]>;
}

export function unit(v: Float32Array): Float32Array {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
}

export function dot(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!;
  return s;
}

/** What is embedded for an ayah: meaning in English and Arabic tafsir (search only). */
export const passageText = (p: Passage) => [p.en, p.enMukhtasar, p.arMuyassar].filter(Boolean).join("\n");

const BATCH = 64;

export class VoyageEmbedder implements Embedder {
  constructor(
    private apiKey: string,
    readonly model: string,
    private fetchImpl: typeof fetch = fetch,
    private backoffMs = 2000,
  ) {}

  async embed(texts: string[], kind: "document" | "query"): Promise<Float32Array[]> {
    const out: Float32Array[] = [];
    for (let i = 0; i < texts.length; i += BATCH) out.push(...(await this.batch(texts.slice(i, i + BATCH), kind)));
    return out;
  }

  private async batch(input: string[], kind: "document" | "query"): Promise<Float32Array[]> {
    let last = "";
    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, this.backoffMs * attempt));
      const res = await this.fetchImpl("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input, model: this.model, input_type: kind }),
      });
      if (res.ok) {
        const json = (await res.json()) as { data: { index: number; embedding: number[] }[] };
        return [...json.data].sort((a, b) => a.index - b.index).map((d) => unit(Float32Array.from(d.embedding)));
      }
      last = `Voyage ${res.status}`;
      if (res.status !== 429 && res.status < 500) break;
    }
    throw new Error(last);
  }
}

/** Offline stand-in for tests: a hashed bag of words, so shared words give higher similarity. */
export class StubEmbedder implements Embedder {
  readonly model = "stub";
  embed: Embedder["embed"] = async (texts) =>
    texts.map((t) => {
      const v = new Float32Array(64);
      for (const tok of tokenize(t)) v[createHash("md5").update(tok).digest()[0]! % 64]! += 1;
      return unit(v);
    });
}
