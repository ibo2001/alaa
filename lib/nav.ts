// App-shell navigation model: which routes are tabs, how deep a route is, and where "back" goes.
// Paths are without the locale prefix (as returned by next-intl's usePathname).

export const TABS = ["/", "/journey", "/lens", "/today", "/about"] as const;
export type TabPath = (typeof TABS)[number];

/** The tab a path belongs to (a card opened from the lens stays under "Look"). */
export function tabFor(path: string): TabPath | null {
  if ((TABS as readonly string[]).includes(path)) return path as TabPath;
  if (path.startsWith("/blessing/") || path.startsWith("/source/")) return "/lens";
  if (path === "/review") return "/about";
  return null;
}

/** 0 for tab roots, deeper for pages pushed on top of them. Drives the slide direction. */
export function depthOf(path: string): number {
  if (path.startsWith("/source/")) return 2;
  if (path.startsWith("/blessing/") || path === "/review") return 1;
  return 0;
}

/** Where the back button goes when there is no in-app history (e.g. a shared link). Null = no back button. */
export function parentOf(path: string): string | null {
  if (path.startsWith("/source/")) return `/blessing/${path.slice("/source/".length)}`;
  if (path.startsWith("/blessing/")) return "/lens";
  if (path === "/review") return "/about";
  return null;
}

export type Transition = "none" | "push" | "pop" | "fade";

export function transitionBetween(from: string | null, to: string): Transition {
  if (from === null || from === to) return "none";
  const a = depthOf(from);
  const b = depthOf(to);
  return b > a ? "push" : b < a ? "pop" : "fade";
}

// In-app history for this browser tab (module state survives client-side navigation, resets on reload).
// Going to the path just below the top counts as "back"; anything else is pushed.
const stack: string[] = [];
export const getLastPath = (): string | null => stack.at(-1) ?? null;
export const setLastPath = (p: string) => {
  if (stack.at(-1) === p) return;
  if (stack.at(-2) === p) stack.pop();
  else stack.push(p);
};
/** True when there is an earlier page from inside the app, so history.back() stays in the app. */
export const hasInAppHistory = () => stack.length > 1;
