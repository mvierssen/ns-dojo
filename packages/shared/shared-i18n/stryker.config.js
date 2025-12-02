import baseConfig from "@ns-dojo/stryker-config";

/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  ...baseConfig,

  // Package-specific file patterns for shared i18n library
  mutate: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.d.ts",
    "!src/**/test/**",
    "!src/**/__tests__/**",
  ],

  testFiles: ["src/**/*.test.ts", "src/**/*.spec.ts"],

  // High thresholds for shared i18n library - used across multiple applications
  thresholds: {
    high: 85,
    low: 70,
    break: 60,
  },

  // Moderate timeout for i18n tests
  timeoutMS: 30_000,
  timeoutFactor: 2,

  // Package-specific report location
  htmlReporter: {
    fileName: "reports/mutation/shared-i18n/index.html",
  },

  // Good concurrency for i18n code
  concurrency: 5,
  maxConcurrentTestRunners: 5,

  // Enable comprehensive mutation testing for i18n logic
  mutator: {
    excludedMutations: [
      "StringLiteral", // i18n libraries often have many string literals for translations
      "RegexMutator", // Keep regex mutations disabled for i18n
    ],
  },
};
