import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Vitest config (TT-05). Kept separate from vite.config.ts so the production
// build config (manualChunks etc.) and the test runner don't entangle.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["client/src/test-setup.ts"],
    include: ["client/src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["client/src/context/**", "client/src/lib/**"],
    },
  },
});
