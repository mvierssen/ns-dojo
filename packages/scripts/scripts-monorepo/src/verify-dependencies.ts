#!/usr/bin/env node
/**
 * Monorepo Dependency Verification Script
 * Verifies that package.json, moon.yml, and tsconfig.json are in sync
 * according to the NS Dojo monorepo dependency classification rules.
 *
 * Rules:
 * 1. Runtime dependencies (imported in src/):
 *    - Must be in: package.json dependencies
 *    - Must be in: moon.yml dependsOn
 *    - Must be in: tsconfig.json references
 *
 * 2. Build-time dependencies (config packages imported in config files):
 *    - Must be in: package.json devDependencies
 *    - Must be in: moon.yml tasks.build.deps (with :build suffix)
 *    - Must be in: tsconfig.json references
 *
 * 3. No unused dependencies should be declared
 */
import {readdir, stat} from "node:fs/promises";
import {basename, join} from "node:path";
import {
  die,
  getPlatformRoot,
  logDebug,
  logError,
  logInfo,
  logSuccess,
  logWarning,
  printSection,
  printSubsection,
} from "@ns-dojo-scripts/lib";
import {
  compareLists,
  difference,
  extractConfigImports,
  extractSrcImports,
  getMoonBuildDeps,
  getMoonDependsOn,
  getPackageJsonDependencies,
  getPackageJsonDevDependencies,
  getTsconfigReferences,
  isConfigPackage,
} from "./monorepo-utils.js";

interface VerificationOptions {
  limit?: number;
  concise?: boolean;
  packagePaths?: string[];
}

let totalPackages = 0;
let packagesWithIssues = 0;

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): VerificationOptions {
  const options: VerificationOptions = {
    packagePaths: [],
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (!arg) {
      i++;
      continue;
    }

    switch (arg) {
      case "-h":
      case "--help": {
        showUsage();
        process.exit(0);
        break;
      }
      case "-l":
      case "--limit": {
        i++;
        const limitValue = args[i];
        if (limitValue) {
          options.limit = Number.parseInt(limitValue, 10);
        }
        break;
      }
      case "-c":
      case "--concise": {
        options.concise = true;
        break;
      }
      default: {
        if (arg.startsWith("-")) {
          die(`Unknown option: ${arg}`);
        } else {
          options.packagePaths?.push(arg);
        }
      }
    }

    i++;
  }

  // Check for environment variable
  if (!options.limit && process.env.VERIFY_LIMIT) {
    options.limit = Number.parseInt(process.env.VERIFY_LIMIT, 10);
  }

  return options;
}

/**
 * Show usage information
 */
function showUsage(): void {
  console.log(`Usage: verify-dependencies.ts [OPTIONS] [PACKAGE_PATHS...]

Verify dependency alignment across package.json, moon.yml, and tsconfig.json.

OPTIONS:
  -h, --help              Show this help message
  -l, --limit N           Verify only first N packages (for testing)
  -c, --concise           Concise output (only show problems, minimal formatting)

ARGUMENTS:
  PACKAGE_PATHS          One or more package paths to verify (relative to services/packages/)
                         If not specified, verifies all packages

EXAMPLES:
  # Verify all packages
  tsx verify-dependencies.ts

  # Verify only first 10 packages
  tsx verify-dependencies.ts --limit 10

  # Verify specific package
  tsx verify-dependencies.ts config/astro-config-base

ENVIRONMENT VARIABLES:
  VERIFY_LIMIT           Alternative to --limit flag
  DEBUG                  Enable debug output

EXIT CODES:
  0                      All packages have correct dependencies
  1                      One or more packages have issues
`);
}

/**
 * Find all packages in services/packages
 */
async function findPackages(
  servicesPackagesDir: string,
  options: VerificationOptions,
): Promise<string[]> {
  const packages: string[] = [];

  if (options.packagePaths && options.packagePaths.length > 0) {
    // Verify specific packages
    for (const pkgPath of options.packagePaths) {
      const fullPath = join(servicesPackagesDir, pkgPath);
      try {
        const dirStat = await stat(fullPath);
        const packageJson = join(fullPath, "package.json");
        const packageJsonStat = await stat(packageJson);

        if (dirStat.isDirectory() && packageJsonStat.isFile()) {
          packages.push(fullPath);
        } else {
          logWarning(`Skipping ${pkgPath}: no package.json found`);
        }
      } catch {
        logWarning(`Skipping ${pkgPath}: not found`);
      }
    }
  } else {
    // Find all packages
    const categories = await readdir(servicesPackagesDir, {
      withFileTypes: true,
    });
    for (const category of categories) {
      if (!category.isDirectory()) continue;

      const categoryPath = join(servicesPackagesDir, category.name);

      const pkgs = await readdir(categoryPath, {withFileTypes: true});
      for (const pkg of pkgs) {
        if (!pkg.isDirectory()) continue;

        const pkgPath = join(categoryPath, pkg.name);
        const packageJson = join(pkgPath, "package.json");

        try {
          const pkgStat = await stat(packageJson);
          if (pkgStat.isFile()) {
            packages.push(pkgPath);
          }
        } catch {
          // Skip if no package.json
        }
      }
    }
  }

  packages.sort();

  if (options.limit && options.limit > 0) {
    return packages.slice(0, options.limit);
  }

  return packages;
}

/**
 * Verify a single package
 */
async function verifyPackage(
  packageDir: string,
  servicesPackagesDir: string,
  options: VerificationOptions,
): Promise<boolean> {
  const packageName = packageDir.slice(
    Math.max(0, servicesPackagesDir.length + 1),
  );
  const pkgBasename = basename(packageDir);

  totalPackages++;
  logDebug(`Verifying ${packageName}...`);

  const packageJson = join(packageDir, "package.json");
  const moonYml = join(packageDir, "moon.yml");
  const tsconfigJson = join(packageDir, "tsconfig.json");

  let hasIssues = false;
  const allIssues: string[] = [];

  // Extract actual imports
  const srcImports = await extractSrcImports(packageDir, packageName);
  const configImports = await extractConfigImports(packageDir, packageName);

  // Get declared dependencies
  const pkgDeps = await getPackageJsonDependencies(packageJson);
  const pkgDevDeps = await getPackageJsonDevDependencies(packageJson);
  const moonDepends = await getMoonDependsOn(moonYml);
  const moonBuildDeps = await getMoonBuildDeps(moonYml);
  const tsRefs = await getTsconfigReferences(tsconfigJson);

  // =============================================================================
  // Runtime Dependencies Verification
  // =============================================================================

  if (srcImports.length > 0) {
    const runtimeIssues: string[] = [];

    // Check package.json dependencies
    const pkgDepsDiff = compareLists(
      srcImports,
      pkgDeps,
      "src/ imports",
      "package.json dependencies",
    );
    if (pkgDepsDiff) {
      runtimeIssues.push("package.json dependencies mismatch:", pkgDepsDiff);
    }

    // Check moon.yml dependsOn
    const moonDependsDiff = compareLists(
      srcImports,
      moonDepends,
      "src/ imports",
      "moon.yml dependsOn",
    );
    if (moonDependsDiff) {
      runtimeIssues.push("moon.yml dependsOn mismatch:", moonDependsDiff);
    }

    // Check tsconfig.json references
    const srcNotInRefs = difference(srcImports, tsRefs);
    if (srcNotInRefs.length > 0) {
      runtimeIssues.push(
        "tsconfig.json references missing runtime deps:",
        ...srcNotInRefs.map((dep) => `    - ${dep}`),
      );
    }

    if (runtimeIssues.length > 0) {
      hasIssues = true;
      if (options.concise) {
        allIssues.push("Runtime:", ...runtimeIssues);
      } else {
        printSubsection(`❌ ${packageName} - Runtime dependency issues`);
        console.log(runtimeIssues.join("\n"));
      }
    }
  }

  // =============================================================================
  // Build-time Dependencies Verification
  // =============================================================================

  if (configImports.length > 0) {
    const buildtimeIssues: string[] = [];

    // Check package.json devDependencies
    const pkgDevDepsDiff = compareLists(
      configImports,
      pkgDevDeps,
      "config imports",
      "package.json devDependencies",
    );
    if (pkgDevDepsDiff) {
      buildtimeIssues.push(
        "package.json devDependencies mismatch:",
        pkgDevDepsDiff,
      );
    }

    // Check moon.yml tasks.build.deps
    const moonBuildDepsDiff = compareLists(
      configImports,
      moonBuildDeps,
      "config imports",
      "moon.yml build.deps",
    );
    if (moonBuildDepsDiff) {
      buildtimeIssues.push(
        "moon.yml tasks.build.deps mismatch:",
        moonBuildDepsDiff,
      );
    }

    // Check tsconfig.json references (filter out config-only packages)
    const nonConfigOnlyImports = configImports.filter(
      (dep) => !isConfigPackage(dep),
    );
    const configNotInRefs = difference(nonConfigOnlyImports, tsRefs);
    if (configNotInRefs.length > 0) {
      buildtimeIssues.push(
        "tsconfig.json references missing build deps:",
        ...configNotInRefs.map((dep) => `    - ${dep}`),
      );
    }

    if (buildtimeIssues.length > 0) {
      hasIssues = true;
      if (options.concise) {
        allIssues.push("\nBuild-time:", ...buildtimeIssues);
      } else {
        printSubsection(`❌ ${packageName} - Build-time dependency issues`);
        console.log(buildtimeIssues.join("\n"));
      }
    }
  }

  // =============================================================================
  // Unused Dependencies Detection
  // =============================================================================

  const unusedIssues: string[] = [];
  const allImports = [...new Set([...srcImports, ...configImports])].toSorted();

  // Check for unused dependencies in package.json
  const unusedDeps = difference(pkgDeps, srcImports);
  if (unusedDeps.length > 0) {
    unusedIssues.push(
      "Unused in package.json dependencies:",
      ...unusedDeps.map((dep) => `    - ${dep}`),
    );
  }

  // Check for unused devDependencies (filter out config packages)
  const unusedDevDeps = difference(pkgDevDeps, configImports).filter(
    (dep) => !isConfigPackage(dep),
  );
  if (unusedDevDeps.length > 0) {
    unusedIssues.push(
      "Unused in package.json devDependencies (might be OK if used via extends):",
      ...unusedDevDeps.map((dep) => `    - ${dep}`),
    );
  }

  // Check for unused moon.yml dependsOn
  const unusedMoonDeps = difference(moonDepends, srcImports);
  if (unusedMoonDeps.length > 0) {
    unusedIssues.push(
      "Unused in moon.yml dependsOn:",
      ...unusedMoonDeps.map((dep) => `    - ${dep}`),
    );
  }

  // Check for unused tsconfig references
  const unusedTsRefs = difference(tsRefs, allImports);
  if (unusedTsRefs.length > 0) {
    unusedIssues.push(
      "Unused in tsconfig.json references:",
      ...unusedTsRefs.map((dep) => `    - ${dep}`),
    );
  }

  if (unusedIssues.length > 0) {
    hasIssues = true;
    if (options.concise) {
      allIssues.push("\nUnused:", ...unusedIssues);
    } else {
      printSubsection(`⚠️  ${packageName} - Unused dependencies`);
      console.log(unusedIssues.join("\n"));
    }
  }

  // =============================================================================
  // TypeScript Project Reference Issues
  // =============================================================================

  const tsRefIssues: string[] = [];

  // Check for self-references
  if (tsRefs.includes(pkgBasename)) {
    tsRefIssues.push(
      "Self-reference detected in tsconfig.json references:",
      `    - ${pkgBasename} (packages should not reference themselves)`,
    );
  }

  // Check for references to config-only packages
  const configOnlyRefs = tsRefs.filter((ref) => isConfigPackage(ref));
  if (configOnlyRefs.length > 0) {
    tsRefIssues.push(
      "Config-only packages in tsconfig.json references:",
      ...configOnlyRefs.map(
        (ref) =>
          `    - ${ref} (should only be used via extends, not references)`,
      ),
    );
  }

  if (tsRefIssues.length > 0) {
    hasIssues = true;
    if (options.concise) {
      allIssues.push("\nTypeScript references:", ...tsRefIssues);
    } else {
      printSubsection(
        `❌ ${packageName} - TypeScript project reference issues`,
      );
      console.log(tsRefIssues.join("\n"));
    }
  }

  // =============================================================================
  // Self-Reference Detection (package.json and moon.yml)
  // =============================================================================

  const selfRefIssues: string[] = [];

  if (pkgDeps.includes(pkgBasename)) {
    selfRefIssues.push(
      "Self-reference in package.json dependencies:",
      `    - ${pkgBasename} (packages should not depend on themselves)`,
    );
  }

  if (pkgDevDeps.includes(pkgBasename)) {
    selfRefIssues.push(
      "Self-reference in package.json devDependencies:",
      `    - ${pkgBasename} (packages should not depend on themselves)`,
    );
  }

  if (moonDepends.includes(pkgBasename)) {
    selfRefIssues.push(
      "Self-reference in moon.yml dependsOn:",
      `    - ${pkgBasename} (packages should not depend on themselves)`,
    );
  }

  if (moonBuildDeps.includes(pkgBasename)) {
    selfRefIssues.push(
      "Self-reference in moon.yml tasks.build.deps:",
      `    - ${pkgBasename} (packages should not depend on themselves)`,
    );
  }

  if (selfRefIssues.length > 0) {
    hasIssues = true;
    if (options.concise) {
      allIssues.push("\nSelf-references:", ...selfRefIssues);
    } else {
      printSubsection(`❌ ${packageName} - Self-reference issues`);
      console.log(selfRefIssues.join("\n"));
    }
  }

  // Print all issues in concise mode
  if (hasIssues) {
    if (options.concise) {
      console.log(`${packageName}:\n`);
      console.log(allIssues.join("\n"));
      console.log("");
    }
    packagesWithIssues++;
  } else {
    logDebug(`✅ ${packageName} - OK`);
  }

  return hasIssues;
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.concise) {
    printSection("Monorepo Dependency Verification");
  }

  const platformRoot = await getPlatformRoot();
  const servicesPackagesDir = join(platformRoot, "services", "packages");

  logDebug("Platform root:", platformRoot);
  logDebug("Services packages dir:", servicesPackagesDir);

  if (!options.concise) {
    logInfo("Finding packages...");
  }

  const packages = await findPackages(servicesPackagesDir, options);

  if (!options.concise) {
    logInfo(`Found ${String(packages.length)} packages to verify\n`);
  }

  // Verify each package
  let current = 0;
  for (const packageDir of packages) {
    current++;
    if (current % 10 === 0 && !options.concise) {
      console.log(
        `Processed ${String(current)}/${String(packages.length)} packages...`,
      );
    }

    await verifyPackage(packageDir, servicesPackagesDir, options);
  }

  if (!options.concise) {
    console.log("Finished processing all packages.\n");

    // Summary
    printSection("Summary");
    console.log(`Total packages checked: ${String(totalPackages)}`);

    if (packagesWithIssues === 0) {
      logSuccess("All packages have correct dependency declarations! ✅");
    } else {
      logError(`Found issues in ${String(packagesWithIssues)} package(s)`);
      console.log("\nTo fix these issues:");
      console.log(
        "  1. Add missing dependencies to package.json (dependencies for src/ imports)",
      );
      console.log(
        "  2. Add missing devDependencies to package.json (for config file imports)",
      );
      console.log(
        "  3. Add missing dependsOn entries to moon.yml (for src/ imports)",
      );
      console.log(
        "  4. Add missing build.deps entries to moon.yml (for config imports, with :build suffix)",
      );
      console.log(
        "  5. Run 'npx moon sync' to update tsconfig.json references automatically",
      );
      console.log(
        "  6. Remove unused dependencies from package.json, moon.yml, and tsconfig.json",
      );
    }
  }

  process.exit(packagesWithIssues > 0 ? 1 : 0);
}

// Run main function
if (import.meta.main) {
  await main().catch((error: unknown) => {
    logError("Unexpected error:", error);
    process.exit(1);
  });
}
