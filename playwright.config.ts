import { loadTestEnvironment } from "./scripts/test-environment";
loadTestEnvironment();
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  webServer: {
    command:
      `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${new URL(process.env.BETTER_AUTH_URL!).port}`,
    url: process.env.BETTER_AUTH_URL + "/login",
    reuseExistingServer: false,
    timeout: 120000,
  },
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  use: {
    baseURL: process.env.BETTER_AUTH_URL,
    headless: true,
    trace: "off",
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
