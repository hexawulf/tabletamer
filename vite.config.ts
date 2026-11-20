import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// App version for the UI (footer, About), read from package.json at build time.
// server/vite.ts imports this file, so esbuild also bundles it into
// dist/index.js, where import.meta.dirname is dist/ and there is no
// package.json. The production server never uses `define`, so fall back
// instead of crashing at start-up.
function appVersion(): string {
  const pkgPath = path.resolve(import.meta.dirname, "package.json");
  if (!fs.existsSync(pkgPath)) return "0.0.0";
  return (JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version: string }).version;
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(appVersion()) },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - changes rarely, cache aggressively
          "react-vendor": ["react", "react-dom", "react/jsx-runtime"],

          // Table/data libs - moderate change frequency
          "table-vendor": ["@tanstack/react-query", "papaparse"],

          // Radix UI primitives still in use - change rarely
          "ui-vendor": [
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-slot",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],

          // Utility libraries - rarely change
          "utils-vendor": ["clsx", "tailwind-merge", "class-variance-authority", "lucide-react"],
        },
      },
    },
  },
  publicDir: path.resolve(import.meta.dirname, "public"),
});
