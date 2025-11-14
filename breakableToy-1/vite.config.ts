import path from "path";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    onConsoleLog(log: string) {
      // Suppress AbortError and network errors from happy-dom cleanup
      if (
        log.includes("AbortError") ||
        log.includes("The operation was aborted") ||
        log.includes("Request aborted") ||
        log.includes("ECONNABORTED") ||
        log.includes("ECONNRESET") ||
        log.includes("socket hang up") ||
        log.includes("Failed to fetch")
      ) {
        return false;
      }
    },
  },
});
