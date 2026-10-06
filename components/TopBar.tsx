"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { hasInAppHistory, parentOf } from "@/lib/nav";
import { BackIcon } from "./icons";
import { LanguageSwitch } from "./LanguageSwitch";

/** Compact translucent bar: back on pushed pages, the app name in the middle, the language switch at the end. */
export function TopBar() {
  const t = useTranslations("nav");
  const app = useTranslations("app");
  const pathname = usePathname();
  const router = useRouter();
  const parent = parentOf(pathname);

  // Go back through history when we came from inside the app; otherwise (shared link) go to the parent page.
  const onBack = () => {
    if (hasInAppHistory()) router.back();
    else if (parent) router.push(parent);
  };

  return (
    <header className="topbar sticky top-0 z-30 text-sama print:hidden">
      <div className="mx-auto grid h-13 w-full max-w-xl grid-cols-[1fr_minmax(0,auto)_1fr] items-center px-2">
        <div className="flex justify-start">
          {parent && (
            <button
              type="button"
              onClick={onBack}
              className="press flex min-h-11 items-center gap-0.5 rounded-full pe-3 ps-1 text-lazima"
            >
              <BackIcon className="size-6 rtl:-scale-x-100" />
              <span className="text-sm">{t("back")}</span>
            </button>
          )}
        </div>
        {/* Home shows the name large in its hero, so the bar leaves it out there (large-title pattern). */}
        {pathname === "/" ? (
          <span />
        ) : (
          <Link href="/" className="press min-w-0 truncate font-heading text-2xl leading-none text-lazima">
            {app("name")}
          </Link>
        )}
        <div className="flex justify-end pe-2">
          <LanguageSwitch label={t("switchLanguage")} ariaLabel={t("switchLanguageLabel")} />
        </div>
      </div>
    </header>
  );
}
