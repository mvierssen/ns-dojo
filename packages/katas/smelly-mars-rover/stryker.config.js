import baseConfig from "@ns-white-crane-white-belt/stryker-config";

/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  ...baseConfig,

  // Package-specific file patterns for API routes and business logic
  mutate: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.d.ts",
    "!src/**/test/**",
    "!src/**/__tests__/**",
    "!src/test-setup/**",
  ],

  testFiles: ["src/**/*.test.ts", "src/**/*.spec.ts"],

  // API-specific thresholds - business logic should be well tested
  thresholds: {
    high: 80,
    low: 65,
    break: 55,
  },

  // Longer timeout for API integration tests
  timeoutMS: 45_000,
  timeoutFactor: 2.5,

  // Package-specific report location
  htmlReporter: {
    baseDir: "reports/mutation/smelly-mars-rover",
  },

  // Conservative concurrency for API tests (might have database interactions)
  concurrency: 2,
  maxConcurrentTestRunners: 2,

  // Enable most mutators for critical API logic
  mutator: {
    excludedMutations: [
      "RegexMutator", // Keep only the most noisy one disabled
    ],
  },
};
