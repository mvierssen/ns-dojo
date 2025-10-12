/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "vitest",
  testRunnerNodeArgs: ["--import=tsx"],
  coverageAnalysis: "perTest",

  // Thresholds - start conservative and increase over time
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },

  // Incremental mode for faster subsequent runs
  incremental: true,
  incrementalFile: "reports/stryker-incremental.json",

  // HTML report configuration
  htmlReporter: {
    fileName: "reports/mutation/index.html",
  },

  // TypeScript checker
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",

  // Build command - ensure packages are built before mutation testing
  buildCommand: "npm run build",

  // Timeout settings
  timeoutMS: 60_000,
  timeoutFactor: 1.5,

  // Plugins
  plugins: [
    "@stryker-mutator/vitest-runner",
    "@stryker-mutator/typescript-checker",
  ],

  // Default file patterns - can be overridden by package-specific configs
  // Excludes patterns aligned with global ignore patterns
  mutate: [
    "packages/*/src/**/*.ts",
    "packages/*/src/**/*.tsx",
    "!packages/*/src/**/*.test.ts",
    "!packages/*/src/**/*.spec.ts",
    "!packages/*/src/**/*.d.ts",
    "!packages/*/src/**/test/**",
    "!packages/*/src/**/__tests__/**",
    "!packages/*/src/**/*.stories.ts",
    "!packages/*/src/**/*.stories.tsx",
    // Exclude auto-generated files
    "!packages/*/src/**/*.gen.*",
    "!packages/*/src/**/auto-imports.d.ts",
    "!packages/*/src/**/routeTree.gen.ts",
    // Exclude build outputs
    "!packages/*/dist/**",
    "!packages/*/build/**",
    "!packages/*/.output/**",
    "!packages/*/out/**",
    // Exclude framework-specific directories
    "!packages/*/.astro/**",
    "!packages/*/.next/**",
    "!packages/*/.nuxt/**",
    "!packages/*/.svelte-kit/**",
    // Exclude cache and temporary files
    "!packages/*/.cache/**",
    "!packages/*/.turbo/**",
    // Exclude mobile platform files
    "!packages/*/android/**",
    "!packages/*/ios/**",
  ],

  // Ignore patterns are handled via mutate patterns above

  // Concurrency - adjust based on system capabilities
  concurrency: 4,

  // Disable some mutators that might be too noisy initially
  mutator: {
    excludedMutations: [
      // These can be enabled later as teams get comfortable
      "StringLiteral", // Often creates very noisy mutations
      "RegexMutator", // Can be complex to understand initially
    ],
  },

  // Logging
  logLevel: "info",
  fileLogLevel: "debug",

  // Temp directory
  tempDirName: "stryker-tmp",
};