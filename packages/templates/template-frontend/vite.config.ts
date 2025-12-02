import baseConfig from "@ns-dojo/vite-config-base";
import {defineConfig, mergeConfig} from "vite";

export default defineConfig(
  mergeConfig(baseConfig, {
    resolve: {
      conditions: ["source"],
    },
  }),
);
