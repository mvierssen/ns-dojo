import baseConfig from "@ns-dojo/eslint-config-base";
import {defineConfig} from "eslint/config";

//import eslintAstro from "eslint-plugin-astro";

export default defineConfig(
  baseConfig,
  // Packages with Astro
  // ...eslintAstro.configs["flat/jsx-a11y-recommended"],
  // {
  //   rules: {
  //     "astro/jsx-a11y/anchor-is-valid": "off",
  //     "astro/jsx-a11y/media-has-caption": "off",
  //   },
  // },
);
