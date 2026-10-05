"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { tabFor, type TabPath } from "@/lib/nav";
import { DayIcon, HomeIcon, InfoIcon, JourneyIcon, LensIcon } from "./icons";

const TABS: { href: TabPath; key: "home" | "journey" | "lens" | "today" | "about"; Icon: typeof HomeIcon }[] = [
  { href: "/", key: "home", Icon: HomeIcon },
  { href: "/journey", key: "journey", Icon: JourneyIcon },
  { href: "/lens", key: "lens", Icon: LensIcon },
  { href: "/today", key: "today", Icon: DayIcon },
  { href: "/about", key: "about", Icon: InfoIcon },
];

/** Bottom tab bar, as in a native app. "Look" is the primary action and sits raised in the middle. */
export function TabBar() {
  const t = useTranslations("nav");
  const active = tabFor(usePathname());

  return (
    <nav aria-label={t("label")} className="tabbar fixed inset-x-0 bottom-0 z-40 print:hidden">
      <ul className="mx-auto grid w-full max-w-xl grid-cols-5 px-2">
        {TABS.map(({ href, key, Icon }) => {
          const current = active === href;
          if (key === "lens") {
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={`press -mt-5 flex flex-col items-center gap-1 text-[0.7rem] font-medium ${current ? "text-lazima" : "text-sama/65"}`}
                >
                  <span className="grid size-14 place-items-center rounded-full bg-lazima text-layl shadow-[0_6px_18px_-4px_rgb(0_0_0/0.45)]">
                    <Icon className="size-7" />
                  </span>
                  {t(key)}
                </Link>
              </li>
            );
          }
          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`press flex min-h-14 min-w-14 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors ${
                  current ? "text-lazima" : "text-sama/65 hover:text-sama"
                }`}
              >
                <Icon className="size-6" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
