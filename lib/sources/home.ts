// Server/build-time only. Home verses, each guarded on its own; any that fails the Guard is dropped.
import { homeRefs } from "@/lib/home";
import type { GuardedAyah, TranslationStatus } from "@/lib/guard";
import { formatRef } from "@/lib/quran/surahs";
import type { Lang } from "@/lib/types";
import { data, getBlessing } from "./data";
import { guardedRefs } from "./passages";

export type HomeVerse = {
  key: string;
  ref: string;
  blessingId: string | null;
  /** Card name, for the link to the card the verse belongs to. */
  label: string | null;
  ayat: GuardedAyah[];
  translation: TranslationStatus;
};

export function homeVerses(lang: Lang): HomeVerse[] {
  const items = homeRefs(data);
  const passages = guardedRefs(
    items.map((i) => i.ref),
    lang,
  );
  return items.flatMap((item, n) => {
    const p = passages[n]!;
    if (!p.ok) return [];
    const b = item.blessingId ? getBlessing(item.blessingId) : undefined;
    return [
      {
        key: item.key,
        ref: formatRef(item.ref, lang),
        blessingId: item.blessingId,
        label: b ? b.labels[lang] : null,
        ayat: p.ayat,
        translation: p.translation,
      },
    ];
  });
}
