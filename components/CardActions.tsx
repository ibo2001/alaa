"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { addToDay, getDay } from "@/lib/myday";
import { BookIcon, CheckIcon, PlusIcon, ShareIcon, SourceIcon } from "./icons";

// Icon-over-label actions, like the action row under a native share sheet.
const action = "press flex min-h-11 flex-col items-center gap-1.5 text-xs text-sama/85 disabled:cursor-default";
const disc = "grid size-12 place-items-center rounded-full";

export function CardActions({
  blessingId,
  title,
  quranUrl,
  readLabel,
}: {
  blessingId: string;
  title: string;
  quranUrl: string;
  readLabel: string;
}) {
  const t = useTranslations("card");
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getDay()
      .then((d) => setAdded(d.some((e) => e.blessingId === blessingId)))
      .catch(() => {});
  }, [blessingId]);

  async function onAdd() {
    try {
      await addToDay(blessingId);
      setAdded(true);
    } catch {
      // IndexedDB unavailable (e.g. private mode): nothing to do, the card still works.
    }
  }

  async function onShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      <button type="button" onClick={onAdd} disabled={added} aria-pressed={added} className={action}>
        <span className={`${disc} transition-colors ${added ? "bg-nakhl text-sama" : "bg-lazima text-layl"}`}>
          {added ? <CheckIcon className="size-6" /> : <PlusIcon className="size-6" />}
        </span>
        <span className={added ? "text-sama" : "font-medium text-lazima"}>{added ? t("added") : t("addToDay")}</span>
      </button>
      <button type="button" onClick={onShare} className={action}>
        <span className={`${disc} bg-sama/10`}>
          <ShareIcon className="size-6" />
        </span>
        <span aria-live="polite">{copied ? t("copied") : t("share")}</span>
      </button>
      <Link href={`/source/${blessingId}`} className={action}>
        <span className={`${disc} bg-sama/10`}>
          <SourceIcon className="size-6" />
        </span>
        {t("source")}
      </Link>
      <a href={quranUrl} target="_blank" rel="noopener noreferrer" aria-label={readLabel} className={action}>
        <span className={`${disc} bg-sama/10`}>
          <BookIcon className="size-6" />
        </span>
        {t("readInContext")}
      </a>
    </div>
  );
}
