/** @type {import("prettier").Config} */
export default {
  // Core formatting options
  semi: true,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  bracketSameLine: true,
  bracketSpacing: false,

  // Plugin configuration
  // Note: The Tailwind CSS plugin must be loaded last
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss",
  ],

  // Import order configuration
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
};
