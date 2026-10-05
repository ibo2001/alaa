import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/ar`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    // e2e uses the stub vision provider so it needs no API key.
    env: { VISION_PROVIDER: "stub", NEXT_DIST_DIR: ".next-e2e" },
  },
});
