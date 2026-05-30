import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    exclude: ["tests-e2e/**", "node_modules/**", ".next/**"],
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: { lines: 80, functions: 75, branches: 55, statements: 75 },
      include: ["src/lib/crop.ts", "src/lib/prompt.ts", "src/lib/slug.ts", "src/lib/styles.ts", "src/components/ConceptBoard.tsx", "src/components/GalleryBoard.tsx", "src/app/api/generate/route.ts", "convex/cards.ts"],
      exclude: ["**/_generated/**", "**/*.test.*"],
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
