import baseConfig, {disableTypeCheckedRules} from "@ns-dojo/eslint-config-base";
import eslintStorybook from "eslint-plugin-storybook";
import {defineConfig} from "eslint/config";
import tseslint from "typescript-eslint";

const GLOB_STORYBOOK = ["[packages/**/*.stories.{js,mjs,cjs,jsx,ts,tsx}"];

export default defineConfig(
  baseConfig,
  // Storybooks - type assertion needed due to plugin type incompatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  ...(eslintStorybook.configs["flat/recommended"] as any[]),
  {
    files: GLOB_STORYBOOK,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        allowAutomaticSingleRunInference: true,
        project: false,
        projectService: false,
      },
    },
    rules: {
      ...disableTypeCheckedRules,
    },
  },
);
