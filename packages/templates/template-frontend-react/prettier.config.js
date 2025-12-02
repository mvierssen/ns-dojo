import baseConfig from "@ns-dojo/prettier-config";

/** @type {import("prettier").Config} */
export default {
  ...baseConfig,
  tailwindStylesheet: "./src/main.css",
};
