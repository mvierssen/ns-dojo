/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "This dependency is part of a circular relationship. You might want to revise your solution (i.e. use dependency inversion, make sure the modules have a single responsibility) ",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "no-orphans",
      comment:
        "This is an orphan module - it is not used by any other module. Either use it or remove it.",
      severity: "warn",
      from: {
        orphan: true,
        pathNot: [
          String.raw`(^|/)\.[^/]+\.(js|cjs|mjs|ts|json)$`, // dot files
          String.raw`\.d\.ts$`, // TypeScript declaration files
          String.raw`(^|/)tsconfig\.json$`, // TypeScript config
          String.raw`(^|/)package\.json$`, // package.json
          String.raw`(^|/)package-lock\.json$`, // package-lock.json
          String.raw`(^|/)README\.(md|txt)$`, // README files
          String.raw`(^|/)LICENSE(\.(md|txt))?$`, // License files
          String.raw`(^|/)\.gitignore$`, // Git ignore
          String.raw`(^|/)jest\.config\.(js|ts|json)$`, // Jest config
          String.raw`(^|/)vitest\.config\.(js|ts)$`, // Vitest config
          String.raw`(^|/)vitest\.setup\.(js|ts)$`, // Vitest setup
          String.raw`(^|/)vite\.config\.(js|ts)$`, // Vite config
          String.raw`(^|/)next\.config\.(js|ts)$`, // Next.js config
          String.raw`(^|/)app\.config\.(js|ts)$`, // Tanstack config
          String.raw`(^|/)astro\.config\.(js|mjs|ts)$`, // Astro config
          String.raw`(^|/)capacitor\.config\.(js|ts|json)$`, // Capacitor config
          String.raw`(^|/)playwright\.config\.(js|ts)$`, // Playwright config
          String.raw`(^|/)prettier\.config\.(js|mjs|ts|json)$`, // Prettier config
          String.raw`(^|/)eslint\.config\.(js|mjs|ts)$`, // ESLint config
          String.raw`(^|/)wrangler\.json$`, // Wrangler config
          "(^|/)Dockerfile$", // Dockerfile
          String.raw`(^|/)docker-compose\.(yml|yaml)$`, // Docker Compose
          String.raw`\.test\.(js|ts|tsx)$`, // Test files
          String.raw`\.spec\.(js|ts|tsx)$`, // Spec files
          String.raw`\.stories\.(js|ts|tsx)$`, // Storybook stories
          "(^|/)coverage/", // Coverage directory
          "(^|/)dist/", // Distribution directory
          "(^|/)build/", // Build directory
          "(^|/)public/", // Public assets
          "(^|/)assets/", // Asset files
          "(^|/)android/", // Android platform files
          "(^|/)ios/", // iOS platform files
          "(^|/)node_modules/", // Node modules
          String.raw`packages/.*/src/index\.ts$`, // Package entry points
          String.raw`packages/.*/\.storybook/main\.ts$`, // Storybook main config
          String.raw`packages/.*/\.storybook/preview\.ts$`, // Storybook preview config
          String.raw`packages/.*/app/layout\.tsx$`, // Next.js app layout
        ],
      },
      to: {},
    },
    {
      name: "no-deprecated-core",
      comment:
        "A module depends on a node core module that has been deprecated. Find an alternative - these are bound to exist - node deprecated the modules for good reasons.",
      severity: "warn",
      from: {},
      to: {
        dependencyTypes: ["core"],
        path: ["^(punycode|domain)$"],
      },
    },
    {
      name: "not-to-deprecated",
      comment:
        "This module uses a (version of an) npm module that has been deprecated. Either upgrade to a later version of that module, or find an alternative. Deprecated modules are a security risk.",
      severity: "warn",
      from: {},
      to: {
        dependencyTypes: ["deprecated"],
      },
    },
    {
      name: "no-non-package-json",
      severity: "error",
      comment:
        "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. That's problematic as the package either (1) won't be available on live (2) is available on live but not in your development environment or (3) is available in both but you latest version of the package on live.",
      from: {},
      to: {
        dependencyTypes: ["npm-no-pkg", "npm-unknown"],
      },
    },
    {
      name: "not-to-unresolvable",
      comment:
        "This module depends on a module that cannot be found ('unresolvable'). This will break your app.",
      severity: "error",
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: "no-duplicate-dep-types",
      comment:
        "Likely this module depends on an external ('npm') package that occurs more than once in your package.json i.e. both as a devDependencies and in dependencies. This will cause maintenance problems later on.",
      severity: "warn",
      from: {},
      to: {
        moreThanOneDependencyType: true,
        // as it's pretty normal to have a type import be a type only import
        // _and_ (e.g.) a devDependency - don't consider type-only dependency
        // types for this rule
        dependencyTypesNot: ["type-only"],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: [
        // Dependencies and Package Management
        "node_modules",
        String.raw`\.pnp`,
        String.raw`\.yarn`,

        // Build Outputs
        "dist",
        "build",
        String.raw`\.output`,
        "out",
        String.raw`\.next`,
        String.raw`\.nuxt`,
        String.raw`\.nitro`,

        // Framework-Specific Directories
        String.raw`\.astro`,
        String.raw`\.svelte-kit`,
        String.raw`\.tanstack`,
        String.raw`\.cache`,
        String.raw`\.docusaurus`,

        // Mobile Applications
        "android",
        "ios",

        // Testing and Coverage
        "coverage",
        String.raw`\.nyc_output`,
        "test-results",
        "playwright-report",
        "blob-report",

        // Mutation Testing
        "stryker-tmp",
        "reports",

        // Cache and Temporary Files
        String.raw`\.moon/cache`,
        String.raw`\.parcel-cache`,

        // Documentation Build Outputs
        "storybook-static",
        "docs/_build",

        // Static Assets
        "public",
        "assets",
      ],
    },
    includeOnly: "^packages",
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts", ".json"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/(@[^/]+/[^/]+|[^/]+)",
      },
      archi: {
        collapsePattern: "^packages/([^/]+)",
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
