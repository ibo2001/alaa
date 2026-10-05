import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? Date.now().toString();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // The service worker is only built for production; in dev it would cache stale code.
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    { url: "/ar/offline", revision },
    { url: "/en/offline", revision },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // E2E builds into its own folder so it can run while `next dev` uses .next (see playwright.config.ts).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // /api/see reads sample photos from disk when they have no cached result.
  outputFileTracingIncludes: { "/api/see": ["./public/samples/**/*"] },
};

export default withSerwist(withNextIntl(nextConfig));
