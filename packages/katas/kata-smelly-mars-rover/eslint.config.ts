import baseConfig from "@ns-dojo/eslint-config-node";
import {defineConfig} from "eslint/config";

export default defineConfig(baseConfig, {
  rules: {
    "@typescript-eslint/no-unnecessary-condition": "off",
  },
});
