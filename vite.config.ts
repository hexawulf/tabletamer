import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
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
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],

          // Table/data libs - moderate change frequency
          'table-vendor': [
            '@tanstack/react-query',
            'papaparse',
          ],

          // Radix UI primitives still in use - change rarely
          'ui-vendor': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],

          // Utility libraries - rarely change
          'utils-vendor': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'lucide-react',
          ],
        },
      },
    },
  },
  publicDir: path.resolve(import.meta.dirname, "public"),
});
