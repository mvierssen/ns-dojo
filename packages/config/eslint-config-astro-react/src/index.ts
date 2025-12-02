import astroConfig from "@ns-dojo/eslint-config-astro";
import reactConfig from "@ns-dojo/eslint-config-react";
import {defineConfig} from "eslint/config";

export default defineConfig(reactConfig, astroConfig);
