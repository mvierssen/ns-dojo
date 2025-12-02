import baseConfig from "@ns-dojo/vitest-config-node";
import {mergeConfig} from "vitest/config";

export default mergeConfig(baseConfig, {
  test: {
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
