"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { addToDay, getDay } from "@/lib/myday";

const btn =
  "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors";

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
    <div className="flex flex-wrap justify-center gap-2">
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        aria-pressed={added}
        className={`${btn} ${added ? "bg-nakhl text-sama" : "bg-lazima text-layl hover:bg-lazima/90"}`}
      >
        {added ? `✓ ${t("added")}` : t("addToDay")}
      </button>
      <button type="button" onClick={onShare} className={`${btn} border border-sama/40 text-sama hover:border-lazima`}>
        {copied ? t("copied") : t("share")}
      </button>
      <Link href={`/source/${blessingId}`} className={`${btn} border border-sama/40 text-sama hover:border-lazima`}>
        {t("source")}
      </Link>
      <a
        href={quranUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={readLabel}
        className={`${btn} border border-sama/40 text-sama hover:border-lazima`}
      >
        {t("readInContext")} ↗
      </a>
    </div>
  );
}
