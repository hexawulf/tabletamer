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
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "react-vendor";
          }
          if (id.includes("/node_modules/papaparse/")) {
            return "table-vendor";
          }
          if (id.includes("/node_modules/@radix-ui/")) {
            return "ui-vendor";
          }
          if (
            id.includes("/node_modules/clsx/") ||
            id.includes("/node_modules/tailwind-merge/") ||
            id.includes("/node_modules/class-variance-authority/") ||
            id.includes("/node_modules/lucide-react/")
          ) {
            return "utils-vendor";
          }
          return undefined;
        },
      },
    },
  },
  publicDir: path.resolve(import.meta.dirname, "public"),
});
