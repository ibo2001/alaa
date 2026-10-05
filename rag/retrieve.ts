// Three retrieval channels over the local index, fused by reciprocal rank. Output: ayah keys only.
import { blessings, getConcept } from "@/lib/sources/data";
import type { Blessing } from "@/lib/types";
import { CHANNEL_DEPTH, RRF_K, TOP_FUSED } from "./config";
import { dot, type Embedder } from "./embed";
import type { RagIndex } from "./index-store";
import { arabicVariants, isArabic, tokenize } from "./text";

export type Query = { text: string; arTerms: string[]; concept: string | null };
export type FoundBy = { root?: number; keywords?: number; meaning?: number };
export type Retrieval = { keys: string[]; foundBy: Record<string, FoundBy>; roots: string[]; channelsMissing: string[] };

export function queryForConcept(id: string): Query {
  const c = getConcept(id);
  if (!c) throw new Error(`Unknown concept "${id}" (see sources/concepts.json)`);
  return { text: [c.labels.en, ...(c.aliases ?? [])].join("; "), arTerms: [c.labels.ar], concept: id };
}

/** A card can cover several concepts (e.g. sun-moon); the query names them all. */
export function queryForBlessing(b: Blessing): Query {
  const ids = [b.concept, ...(b.relatedConcepts ?? [])];
  const cs = ids.map((id) => getConcept(id)).filter((c) => c !== undefined);
  return {
    text: [b.labels.en, ...cs.flatMap((c) => [c.labels.en, ...(c.aliases ?? [])])].join("; "),
    arTerms: [b.labels.ar, ...cs.map((c) => c.labels.ar)],
    concept: b.concept,
  };
}

export function queryForText(text: string): Query {
  return { text, arTerms: tokenize(text).filter(isArabic), concept: null };
}

export function queryRoots(q: Query, lexicon: Record<string, string[]>): string[] {
  const roots = new Set<string>();
  for (const term of [...q.arTerms, ...tokenize(q.text).filter(isArabic)]) {
    for (const tok of tokenize(term)) for (const v of arabicVariants(tok)) for (const r of lexicon[v] ?? []) roots.add(r);
  }
  return [...roots].sort();
}

export function rootChannel(q: Query, index: RagIndex): string[] {
  const roots = new Set(queryRoots(q, index.lexicon));
  if (roots.size === 0) return [];
  return index.passages
    .map((p, i) => ({ key: p.key, i, n: p.roots.filter((r) => roots.has(r)).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .slice(0, CHANNEL_DEPTH)
    .map((x) => x.key);
}

export class Bm25 {
  private df = new Map<string, number>();
  private tf: Map<string, number>[];
  private len: number[];
  private avg: number;
  constructor(docs: string[][], private k1 = 1.2, private b = 0.75) {
    this.tf = docs.map((d) => {
      const m = new Map<string, number>();
      for (const t of d) m.set(t, (m.get(t) ?? 0) + 1);
      for (const t of m.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      return m;
    });
    this.len = docs.map((d) => d.length);
    this.avg = this.len.reduce((a, b) => a + b, 0) / Math.max(1, docs.length);
  }
  search(terms: string[]): { i: number; score: number }[] {
    const N = this.tf.length;
    const uniq = [...new Set(terms)];
    const out: { i: number; score: number }[] = [];
    this.tf.forEach((m, i) => {
      let s = 0;
      for (const t of uniq) {
        const f = m.get(t);
        if (!f) continue;
        const df = this.df.get(t)!;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        s += (idf * f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * this.len[i]!) / this.avg));
      }
      if (s > 0) out.push({ i, score: s });
    });
    return out.sort((a, b) => b.score - a.score || a.i - b.i);
  }
}

const expand = (tokens: string[]) => tokens.flatMap((t) => (isArabic(t) ? arabicVariants(t) : [t]));

export function buildBm25(index: RagIndex): Bm25 {
  return new Bm25(index.passages.map((p) => expand(tokenize([p.ar, p.en, p.enMukhtasar, p.arMuyassar].join(" ")))));
}

export function keywordChannel(q: Query, index: RagIndex, bm25: Bm25): string[] {
  const terms = expand(tokenize([q.text, ...q.arTerms].join(" ")));
  return bm25.search(terms).slice(0, CHANNEL_DEPTH).map((r) => index.passages[r.i]!.key);
}

export async function meaningChannel(q: Query, index: RagIndex, embedder: Embedder): Promise<string[]> {
  if (!index.embeddings) throw new Error("index has no embeddings");
  const [v] = await embedder.embed([[q.text, ...q.arTerms].join("; ")], "query");
  return index.embeddings
    .map((e, i) => ({ i, s: dot(e, v!) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, CHANNEL_DEPTH)
    .map((x) => index.passages[x.i]!.key);
}

export function fuse(lists: string[][], order: Map<string, number>, k = RRF_K): string[] {
  const score = new Map<string, number>();
  for (const list of lists) list.forEach((key, r) => score.set(key, (score.get(key) ?? 0) + 1 / (k + r + 1)));
  return [...score].sort((a, b) => b[1] - a[1] || (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0)).map(([key]) => key);
}

export async function retrieve(q: Query, index: RagIndex, opts: { bm25: Bm25; embedder: Embedder | null }): Promise<Retrieval> {
  const channels: Record<keyof FoundBy, string[]> = {
    root: rootChannel(q, index),
    keywords: keywordChannel(q, index, opts.bm25),
    meaning: [],
  };
  const channelsMissing: string[] = [];
  if (opts.embedder && index.embeddings) {
    try {
      channels.meaning = await meaningChannel(q, index, opts.embedder);
    } catch {
      channelsMissing.push("meaning");
    }
  } else {
    channelsMissing.push("meaning");
  }
  const order = new Map(index.passages.map((p, i) => [p.key, i]));
  const keys = fuse(Object.values(channels), order).slice(0, TOP_FUSED);
  const foundBy: Record<string, FoundBy> = {};
  for (const key of keys) {
    const f: FoundBy = {};
    for (const [name, list] of Object.entries(channels) as [keyof FoundBy, string[]][]) {
      const r = list.indexOf(key);
      if (r >= 0) f[name] = r + 1;
    }
    foundBy[key] = f;
  }
  return { keys, foundBy, roots: queryRoots(q, index.lexicon), channelsMissing };
}

/** Draft cards: the questions still open with the reviewer. */
export const draftBlessings = () => blessings.filter((b) => b.review.mapping !== "reviewed");
