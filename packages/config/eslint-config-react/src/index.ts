import baseConfig, {
  GLOB_SRC_JS_WITHONLY_JSX,
  GLOB_SRC_JS_WITHOUT_JSX,
  GLOB_SRC_TS_WITHONLY_JSX,
  GLOB_SRC_TS_WITHOUT_JSX,
} from "@ns-dojo/eslint-config-base";
import eslintJsxA11y from "eslint-plugin-jsx-a11y";
import eslintReact from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";
import eslintReactRefresh from "eslint-plugin-react-refresh";
import {defineConfig} from "eslint/config";
import globals from "globals";

export default defineConfig(
  baseConfig,
  // Source without JSX
  {
    files: [...GLOB_SRC_JS_WITHOUT_JSX, ...GLOB_SRC_TS_WITHOUT_JSX],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      react: eslintReact,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Source with JSX - React Hooks flat config
  {
    ...eslintReactHooks.configs.flat["recommended-latest"],
    files: [...GLOB_SRC_JS_WITHONLY_JSX, ...GLOB_SRC_TS_WITHONLY_JSX],
  },

  // Source with JSX - Other configs
  {
    extends: [
      eslintJsxA11y.flatConfigs.recommended,
      eslintReactRefresh.configs.recommended,
    ],
    files: [...GLOB_SRC_JS_WITHONLY_JSX, ...GLOB_SRC_TS_WITHONLY_JSX],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: eslintReact,
    },
    rules: {
      ...eslintReact.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        {allowConstantExport: true},
      ],
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
