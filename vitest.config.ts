import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Vitest config (TT-05). Kept separate from vite.config.ts so the production
// build config (manualChunks etc.) and the test runner don't entangle.
// App version for the UI (footer, About), read from package.json at build time.
const { version } = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, "package.json"), "utf-8"),
) as { version: string };

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["client/src/test-setup.ts"],
    include: ["client/src/**/*.{test,spec}.{ts,tsx}", "server/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      include: ["client/src/context/**", "client/src/lib/**"],
    },
  },
});
