import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover"],
      exclude: ["dist/**", "coverage/**", "**/*.d.ts"],
    },
  },
});
