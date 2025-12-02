/// <reference types="vitest" />

import baseConfig from "@ns-dojo/vitest-config-react";
import {defineConfig, mergeConfig} from "vitest/config";

export default defineConfig(
  mergeConfig(baseConfig, {
    test: {
      setupFiles: ["./vitest.setup.ts"],
    },
  }),
);
