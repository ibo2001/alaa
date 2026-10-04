import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, Vercel internals and any file with an extension
  // (sw.js, manifest.webmanifest, icons, sample photos).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
