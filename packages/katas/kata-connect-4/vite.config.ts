import {defineConfig, mergeConfig} from "vite";
import baseConfig from "@ns-dojo/vite-config-base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    build: {
      lib: {
        entry: "src/main.ts",
        formats: ["es"],
        fileName: "main",
      },
      rollupOptions: {
        external: [
          "readline",
          "node:readline",
          "node:readline/promises",
          "@ns-dojo/shared-core",
          "zod",
        ],
        output: {
          banner: "#!/usr/bin/env node",
        },
      },
      target: "node22",
      outDir: "dist",
    },
  }),
);
