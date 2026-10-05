"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { getLastPath, setLastPath, transitionBetween } from "@/lib/nav";

/**
 * Entrance motion for each page (mounted fresh by app/[locale]/template.tsx on every navigation):
 * deeper pages slide in from the inline end, going back slides in from the start, tabs crossfade.
 * Only transform/opacity are animated, and the transform is dropped when done so fixed children still work.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [kind] = useState(() => transitionBetween(getLastPath(), pathname));

  useEffect(() => {
    setLastPath(pathname);
  }, [pathname]);

  return <div className={kind === "none" ? undefined : `page-${kind}`}>{children}</div>;
}
