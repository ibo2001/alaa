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
    <fieldset className="mt-8 w-full max-w-md">
      <legend className="mx-auto text-base font-medium">{t("question")}</legend>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={stage === s}
            onClick={() => void choose(s)}
            className={`min-h-12 rounded-2xl border-2 px-3 py-2 text-sm transition-colors ${
              stage === s ? "border-layl bg-layl text-lazima" : "border-layl/30 text-layl hover:border-layl"
            }`}
          >
            {t(s)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-layl/70">{t("hint")}</p>
    </fieldset>
  );
}
