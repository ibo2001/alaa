import registry from "@/sources/translations/index.json";
import type { Lang } from "@/lib/types";

export type TranslationMeta = {
  id: string;
  lang: Lang;
  dir: string;
  file: string;
  translator: string;
  attribution: string;
  url: string;
  license: string;
  licenseUrl: string;
  obtainedFrom: string;
};

export const translationRegistry: Record<string, TranslationMeta> = Object.fromEntries(
  Object.entries(registry).map(([id, m]) => [id, { id, ...m, lang: m.lang as Lang }]),
);
