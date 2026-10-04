import { useTranslations } from "next-intl";
import type { GuardedAyah, TranslationStatus } from "@/lib/guard";
import { formatNumber } from "@/lib/quran/surahs";
import type { Lang } from "@/lib/types";

/**
 * Renders Guard-verified ayat. Text comes only from the Tanzil file via the Source Guard;
 * this component never receives unverified text.
 */
export function VersePassage({
  ayat,
  translation,
  lang,
  tone = "light",
  size = "lg",
}: {
  ayat: GuardedAyah[];
  translation: TranslationStatus;
  lang: Lang;
  tone?: "light" | "dark" | "gold";
  size?: "lg" | "xl";
}) {
  const t = useTranslations("card");
  const color = tone === "gold" ? "text-lazima" : tone === "dark" ? "text-sama" : "text-layl";
  const muted = tone === "light" ? "text-layl/75" : "text-sama/80";

  return (
    <div>
      <p lang="ar" dir="rtl" className={`verse ${color} ${size === "xl" ? "text-3xl" : "text-2xl"} text-center`}>
        {ayat.map((a) => (
          <span key={a.key}>
            {a.text}{" "}
            <span className="whitespace-nowrap text-[0.7em] opacity-80" aria-label={t("ayahNumber", { n: a.ayah })}>
              ({formatNumber(a.ayah, "ar")})
            </span>{" "}
          </span>
        ))}
      </p>

      {translation.status === "shown" && (
        <div lang="en" dir="ltr" className={`mt-4 text-start ${muted}`}>
          <p className="leading-relaxed">
            {ayat.map((a) => (
              <span key={a.key}>
                {a.translation} <span className="text-xs">({a.ayah})</span>{" "}
              </span>
            ))}
          </p>
          <p className="mt-2 text-xs">
            <a href={translation.meta.url} target="_blank" rel="noopener noreferrer" className="underline">
              {t("translationBy", { translator: translation.meta.translator })}
            </a>{" "}
            ·{" "}
            <a href={translation.meta.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {translation.meta.license}
            </a>
          </p>
        </div>
      )}
      {translation.status === "pending" && lang !== "ar" && (
        <p className={`mt-3 text-sm italic ${muted}`}>{t("translationPending")}</p>
      )}
    </div>
  );
}
