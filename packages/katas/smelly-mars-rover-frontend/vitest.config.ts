/// <reference types="vitest" />

import baseConfig from "@ns-white-crane-white-belt/vitest-config-node";
import {defineConfig, mergeConfig} from "vitest/config";

export default defineConfig(mergeConfig(baseConfig, {}));
