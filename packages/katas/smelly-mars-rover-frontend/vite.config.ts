import baseConfig from "@ns-white-crane-white-belt/vite-config-base";
import {defineConfig, mergeConfig} from "vite";

export default defineConfig(
  mergeConfig(baseConfig, {
    resolve: {
      conditions: ["@ns-white-crane-white-belt/source"],
    },
  }),
);
