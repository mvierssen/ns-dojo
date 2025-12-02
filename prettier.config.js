/** @type {import('prettier').Config} */

export default {
  // Core formatting options
  semi: true,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  bracketSameLine: true,
  bracketSpacing: false,

  // Plugin configuration
  plugins: ["@ianvs/prettier-plugin-sort-imports"],

  // Import order configuration
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
};
