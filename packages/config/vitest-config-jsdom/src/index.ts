import base from "@ns-white-crane-white-belt/vitest-config-base";
import {mergeConfig} from "vitest/config";

export default mergeConfig(base, {
  test: {
    environment: "jsdom",
    globals: true,
  },
});
