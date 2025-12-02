/**
 * Monorepo dependency verification utilities
 * Provides functions for checking dependency alignment across package.json, moon.yml, and tsconfig.json
 */

import {readdir, readFile as readFileNode} from "node:fs/promises";
import {join} from "node:path";
import {parse as parseYaml} from "yaml";

// Helper to read file as string
async function readFile(path: string): Promise<string> {
  return await readFileNode(path, "utf8");
}

const NS_DOJO_PREFIX = "@ns-dojo/";

/**
 * Check if a package name is a config package
 */
export function isConfigPackage(pkgName: string): boolean {
  return (
    pkgName.startsWith("ts-config-") ||
    pkgName.startsWith("eslint-config-") ||
    pkgName.startsWith("vitest-config-") ||
    pkgName.startsWith("vite-config-") ||
    pkgName.startsWith("astro-config-") ||
    pkgName === "next-config" ||
    pkgName === "prettier-config" ||
    pkgName === "stryker-config"
  );
}

/**
 * Extract workspace imports from TypeScript/JavaScript files
 */
export async function extractWorkspaceImports(dir: string): Promise<string[]> {
  const imports = new Set<string>();

  try {
    for await (const entry of walkFiles(dir, [
      ".js",
      ".tsx",
      ".js",
      ".jsx",
      ".mjs",
    ])) {
      const content = await readFile(entry);
      const matches = content.matchAll(/from ['"]@ns-dojo\/([\w-]+)['"]/g);

      for (const match of matches) {
        const pkg = match[1];
        if (pkg) {
          imports.add(pkg);
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return Array.from(imports).toSorted();
}

/**
 * Walk directory and yield files with specific extensions
 */
async function* walkFiles(
  dir: string,
  extensions: string[],
): AsyncGenerator<string> {
  try {
    const entries = await readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) {
        yield* walkFiles(path, extensions);
      } else if (
        entry.isFile() &&
        extensions.some((ext) => entry.name.endsWith(ext))
      ) {
        yield path;
      }
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Extract workspace imports from src/ directory (runtime dependencies)
 */
export async function extractSrcImports(
  packageDir: string,
  packageName?: string,
): Promise<string[]> {
  const imports = await extractWorkspaceImports(join(packageDir, "src"));

  // Filter out self-references
  if (packageName) {
    const pkgBasename = packageName.split("/").pop();
    return pkgBasename ? imports.filter((imp) => imp !== pkgBasename) : imports;
  }

  return imports;
}

/**
 * Extract workspace imports from config files (dev dependencies)
 */
export async function extractConfigImports(
  packageDir: string,
  packageName?: string,
): Promise<string[]> {
  const imports = new Set<string>();

  // Config file patterns to check
  const configPatterns = [
    "*.config.js",
    "*.config.js",
    "*.config.mjs",
    "*.config.cjs",
    "vitest.setup.js",
    "vitest.setup.js",
    "eslint.config.js",
    "eslint.config.js",
    ".prettierrc.js",
  ];

  // Check config files
  for (const pattern of configPatterns) {
    try {
      const files = pattern.includes("*")
        ? await findFiles(packageDir, pattern)
        : [join(packageDir, pattern)];

      for (const file of files) {
        try {
          const content = await readFile(file);
          const matches = content.matchAll(/from ['"]@ns-dojo\/([\w-]+)['"]/g);

          for (const match of matches) {
            const pkg = match[1];
            if (pkg) {
              imports.add(pkg);
            }
          }
        } catch {
          // File doesn't exist
        }
      }
    } catch {
      // Pattern matching failed
    }
  }

  // Extract from tsconfig.json extends field
  try {
    const tsconfigPath = join(packageDir, "tsconfig.json");
    const tsconfigContent = await readFile(tsconfigPath);
    const tsconfig = JSON.parse(tsconfigContent) as {extends?: string};

    if (tsconfig.extends) {
      const extendsMatch = /^@ns-dojo\/([\w-]+)/.exec(tsconfig.extends);
      if (extendsMatch?.[1]) {
        imports.add(extendsMatch[1]);
      }
    }
  } catch {
    // tsconfig.json doesn't exist or can't be parsed
  }

  let result = Array.from(imports).toSorted();

  // Filter out self-references
  if (packageName) {
    const pkgBasename = packageName.split("/").pop();
    result = pkgBasename ? result.filter((imp) => imp !== pkgBasename) : result;
  }

  return result;
}

/**
 * Find files matching a glob pattern in a directory
 */
async function findFiles(dir: string, pattern: string): Promise<string[]> {
  const files: string[] = [];
  const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");

  try {
    const entries = await readdir(dir, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isFile() && regex.test(entry.name)) {
        files.push(join(dir, entry.name));
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return files;
}

/**
 * Get workspace dependencies from package.json
 */
export async function getPackageJsonDependencies(
  packageJsonPath: string,
): Promise<string[]> {
  try {
    const content = await readFile(packageJsonPath);
    const pkg = JSON.parse(content) as {dependencies?: Record<string, string>};
    const deps = pkg.dependencies ?? {};

    return Object.keys(deps)
      .filter((dep) => dep.startsWith(NS_DOJO_PREFIX))
      .map((dep) => dep.slice(NS_DOJO_PREFIX.length))
      .toSorted();
  } catch {
    return [];
  }
}

/**
 * Get workspace devDependencies from package.json
 */
export async function getPackageJsonDevDependencies(
  packageJsonPath: string,
): Promise<string[]> {
  try {
    const content = await readFile(packageJsonPath);
    const pkg = JSON.parse(content) as {
      devDependencies?: Record<string, string>;
    };
    const devDeps = pkg.devDependencies ?? {};

    return Object.keys(devDeps)
      .filter((dep) => dep.startsWith(NS_DOJO_PREFIX))
      .map((dep) => dep.slice(NS_DOJO_PREFIX.length))
      .toSorted();
  } catch {
    return [];
  }
}

/**
 * Get dependsOn from moon.yml
 */
export async function getMoonDependsOn(moonYmlPath: string): Promise<string[]> {
  try {
    const content = await readFile(moonYmlPath);
    const moon = parseYaml(content) as {dependsOn?: string[]};

    return (moon.dependsOn ?? []).toSorted();
  } catch {
    return [];
  }
}

/**
 * Get tasks.build.deps from moon.yml (excluding ^:build and removing :build suffix)
 */
export async function getMoonBuildDeps(moonYmlPath: string): Promise<string[]> {
  try {
    const content = await readFile(moonYmlPath);
    const moon = parseYaml(content) as {tasks?: {build?: {deps?: string[]}}};

    const deps = moon.tasks?.build?.deps ?? [];

    return deps
      .filter((dep) => dep !== "^:build")
      .map((dep) => dep.replace(/:build$/, ""))
      .toSorted();
  } catch {
    return [];
  }
}

/**
 * Get references from tsconfig.json (extract package names from paths)
 */
export async function getTsconfigReferences(
  tsconfigPath: string,
): Promise<string[]> {
  try {
    const content = await readFile(tsconfigPath);
    const tsconfig = JSON.parse(content) as {references?: {path: string}[]};
    const references = tsconfig.references ?? [];

    return references
      .map((ref) => ref.path.split("/").pop())
      .filter((name): name is string => name !== undefined)
      .toSorted();
  } catch {
    return [];
  }
}

/**
 * Compare two sorted lists and return differences
 */
export function compareLists(
  list1: string[],
  list2: string[],
  _name1: string,
  name2: string,
): string | null {
  const set1 = new Set(list1);
  const set2 = new Set(list2);

  const inList1Only = list1.filter((item) => !set2.has(item));
  const inList2Only = list2.filter((item) => !set1.has(item));

  if (inList1Only.length === 0 && inList2Only.length === 0) {
    return null;
  }

  const output: string[] = [];

  if (inList1Only.length > 0) {
    output.push(
      `  Missing in ${name2}:`,
      ...inList1Only.map((item) => `    - ${item}`),
    );
  }

  if (inList2Only.length > 0) {
    output.push(
      `  Extra in ${name2}:`,
      ...inList2Only.map((item) => `    + ${item}`),
    );
  }

  return output.join("\n");
}

/**
 * Get items in list1 that are not in list2
 */
export function difference(list1: string[], list2: string[]): string[] {
  const set2 = new Set(list2);
  return list1.filter((item) => !set2.has(item));
}
