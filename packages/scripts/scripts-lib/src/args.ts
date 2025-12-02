/**
 * Argument parsing utilities for NS Dojo platform TypeScript scripts
 */

import {die} from "./error-handling.js";

/**
 * Check if help flag is present and exit if so
 */
export function checkHelpFlag(args: string[], helpText: string): void {
  for (const arg of args) {
    if (arg === "-h" || arg === "--help") {
      console.log(helpText);
      process.exit(0);
    }
  }
}

/**
 * Parse environment alias (e.g., "development=staging")
 * Returns { alias, source } or null if not a valid alias
 */
export function parseEnvironmentAlias(
  aliasString: string,
): {alias: string; source: string} | null {
  if (!aliasString.includes("=")) {
    return null;
  }

  const [alias, source] = aliasString.split("=", 2);

  if (!alias || !source) {
    die(`Invalid alias format '${aliasString}'. Expected format: alias=source`);
  }

  return {alias, source};
}

/**
 * Validate feature name format (only letters, numbers, hyphens, underscores)
 */
export function validateFeatureName(featureName: string): boolean {
  const pattern = /^[\w-]+$/;
  if (!pattern.test(featureName)) {
    die(
      "Feature name must contain only letters, numbers, hyphens, and underscores",
    );
  }
  return true;
}

/**
 * Generate standard usage template
 */
export function generateUsage(
  scriptName: string,
  description: string,
  usageLine: string,
  examples: string,
): string {
  return `Usage: ${scriptName} ${usageLine}

${description}

Options:
  -h, --help    Show this help message and exit

Examples:
${examples}`;
}

/**
 * Parse boolean flag from arguments
 * Returns true if flag is present, false otherwise
 */
export function hasFlag(args: string[], ...flags: string[]): boolean {
  return args.some((arg) => flags.includes(arg));
}

/**
 * Get value after a flag
 * Example: getFlag(["--limit", "10"], "--limit", "-l") returns "10"
 */
export function getFlag(args: string[], ...flags: string[]): string | null {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg && flags.includes(arg) && i + 1 < args.length) {
      const value = args[i + 1];
      return value ?? null;
    }
  }
  return null;
}

/**
 * Remove flags from arguments and return remaining values
 */
export function getRemainingArgs(
  args: string[],
  ...flagsToRemove: string[]
): string[] {
  const result: string[] = [];
  let skipNext = false;

  for (const arg of args) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (arg && flagsToRemove.includes(arg)) {
      skipNext = true; // Skip the flag value too
      continue;
    }

    if (arg && !arg.startsWith("-")) {
      result.push(arg);
    }
  }

  return result;
}
