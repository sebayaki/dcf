import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * GitHub Pages: default `VITE_BASE=./` so assets resolve on project sites.
 * Override with `VITE_BASE=/` for root hosting if needed.
 */
const base = process.env.VITE_BASE ?? "./";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
