import base from "@ns-dojo/vitest-config-base";
import {mergeConfig} from "vitest/config";

export default mergeConfig(base, {
  test: {
    environment: "node",
    globals: false,
  },
});
