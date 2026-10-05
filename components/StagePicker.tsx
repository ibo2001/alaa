"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getStage, setStage } from "@/lib/device";
import type { Stage } from "@/lib/types";

const OPTIONS: Stage[] = ["new", "familiar"];

/** Optional, user-chosen learning stage. Stored on the device only; never inferred from behavior. */
export function StagePicker() {
  const t = useTranslations("stage");
  const [stage, setLocal] = useState<Stage | null>(null);

  useEffect(() => {
    getStage().then(setLocal).catch(() => {});
  }, []);

  async function choose(s: Stage) {
    setLocal(s);
    try {
      await setStage(s);
    } catch {
      // IndexedDB unavailable: the choice applies to this visit only.
    }
  }

  return (
    <fieldset className="rounded-2xl bg-surface p-4 shadow-sm">
      <legend className="sr-only">{t("question")}</legend>
      <p aria-hidden className="text-center font-medium">
        {t("question")}
      </p>
      {/* Segmented control */}
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-layl/[0.07] p-1">
        {OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={stage === s}
            onClick={() => void choose(s)}
            className={`min-h-11 rounded-[0.6rem] px-2 text-sm transition-all duration-200 ${
              stage === s ? "bg-layl font-medium text-lazima shadow-sm" : "text-layl/75 hover:text-layl"
            }`}
          >
            {t(s)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-layl/60">{t("hint")}</p>
    </fieldset>
  );
}
