import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

function viteBase(): string {
  const raw = process.env.VITE_BASE_PATH?.trim() || "/";
  if (raw === "./" || raw === ".") return "./";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

export default defineConfig({
  base: viteBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
