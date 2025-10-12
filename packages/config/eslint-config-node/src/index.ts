import baseConfig, {
  GLOB_SRC_JS_WITHOUT_JSX,
  GLOB_SRC_TS_WITHOUT_JSX,
} from "@ns-white-crane-white-belt/eslint-config-base";
import {defineConfig} from "eslint/config";
import globals from "globals";

export default defineConfig(
  baseConfig,
  // Source without JSX
  {
    files: [...GLOB_SRC_JS_WITHOUT_JSX, ...GLOB_SRC_TS_WITHOUT_JSX],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
);
