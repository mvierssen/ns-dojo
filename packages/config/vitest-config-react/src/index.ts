import jsdom from "@ns-dojo/vitest-config-jsdom";
import react from "@vitejs/plugin-react";
import {mergeConfig} from "vitest/config";

export default mergeConfig(jsdom, {plugins: [react()]});
