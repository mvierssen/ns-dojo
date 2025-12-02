/**
 * Path and file utilities for NS Dojo platform TypeScript scripts
 */

import {exec} from "node:child_process";
import {readdir, stat} from "node:fs/promises";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {promisify} from "node:util";
import {logDebug} from "./logging.js";

const execAsync = promisify(exec);

/**
 * Get absolute path to script directory
 */
export function getScriptDir(importMetaUrl: string): string {
  const scriptPath = fileURLToPath(importMetaUrl);
  return dirname(scriptPath);
}

/**
 * Get absolute path to platform root
 * Searches upward from current directory for platform indicators
 */
export async function getPlatformRoot(startDir?: string): Promise<string> {
  const currentDir = startDir ?? process.cwd();

  logDebug("Searching for platform root starting from:", currentDir);

  let searchDir = currentDir;
  const maxLevels = 5;

  for (let i = 0; i < maxLevels; i++) {
    logDebug("Checking directory:", searchDir);

    // Check for platform root indicators
    const hasClaudeMd = await fileExists(join(searchDir, "CLAUDE.md"));
    const hasCluster = await dirExists(join(searchDir, "clusters"));
    const hasServices = await dirExists(join(searchDir, "services"));

    if (hasClaudeMd && hasCluster && hasServices) {
      logDebug("Found platform root:", searchDir);
      return searchDir;
    }

    // Alternative check: count platform directories
    const platformDirs = ["clusters", "services", "infrastructures", "scripts"];
    let indicatorCount = 0;

    for (const dir of platformDirs) {
      if (await dirExists(join(searchDir, dir))) {
        indicatorCount++;
      }
    }

    if (indicatorCount >= 3) {
      logDebug("Found platform root based on directory indicators:", searchDir);
      return searchDir;
    }

    // Move up one level
    const parent = dirname(searchDir);
    if (parent === searchDir) {
      logDebug("Reached filesystem root");
      break;
    }
    searchDir = parent;
  }

  // Fallback: try git root
  try {
    const gitRoot = await getGitRoot();
    if (gitRoot) {
      logDebug("Falling back to git root:", gitRoot);
      return gitRoot;
    }
  } catch {
    // Ignore git errors
  }

  // Final fallback: use current directory
  logDebug("Using current directory as fallback");
  return currentDir;
}

/**
 * Get git root directory
 */
export async function getGitRoot(): Promise<string | null> {
  try {
    const {stdout} = await execAsync("git rev-parse --show-toplevel");
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Check if file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Check if directory exists
 */
export async function dirExists(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get file modification time (returns Date or null)
 */
export async function getFileMtime(file: string): Promise<Date | null> {
  try {
    const stats = await stat(file);
    return stats.mtime;
  } catch {
    return null;
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date | null): string {
  if (!date) {
    return "never";
  }

  const formatted = date.toISOString().replace("T", " ").split(".")[0];
  return formatted ?? "never";
}

/**
 * Find cluster directory starting from platform root
 */
export async function findClusterDirectory(
  platformRoot?: string,
): Promise<string | null> {
  const root = platformRoot ?? (await getPlatformRoot());

  logDebug("Searching for cluster directory from platform root:", root);

  const candidates = [
    join(root, "clusters"),
    join(root, "..", "clusters"),
    join(root, "clusters"),
    join(root, "..", "clusters"),
  ];

  for (const candidate of candidates) {
    if (
      (await dirExists(candidate)) &&
      (await validateClusterDirectory(candidate))
    ) {
      logDebug("Found cluster directory:", candidate);
      return candidate;
    }
  }

  logDebug("No valid cluster directory found");
  return null;
}

/**
 * Find infrastructure directory starting from platform root
 */
export async function findInfrastructureDirectory(
  platformRoot?: string,
): Promise<string | null> {
  const root = platformRoot ?? (await getPlatformRoot());

  logDebug("Searching for infrastructure directory from platform root:", root);

  const candidates = [
    join(root, "infrastructures"),
    join(root, "..", "infrastructures"),
    join(root, "infra"),
    join(root, "..", "infra"),
  ];

  for (const candidate of candidates) {
    if (
      (await dirExists(candidate)) &&
      (await validateInfrastructureDirectory(candidate))
    ) {
      logDebug("Found infrastructure directory:", candidate);
      return candidate;
    }
  }

  logDebug("No valid infrastructure directory found");
  return null;
}

/**
 * Validate that a directory is a valid cluster directory
 */
export async function validateClusterDirectory(
  clusterDir: string,
): Promise<boolean> {
  if (!(await dirExists(clusterDir))) {
    logDebug("Cluster directory does not exist:", clusterDir);
    return false;
  }

  const requiredIndicators = ["clusters", "infrastructures"];

  for (const indicator of requiredIndicators) {
    if (await dirExists(join(clusterDir, indicator))) {
      logDebug("Validated cluster directory:", clusterDir);
      return true;
    }
  }

  logDebug("Cluster directory missing required indicators:", clusterDir);
  return false;
}

/**
 * Validate that a directory is a valid infrastructure directory
 */
export async function validateInfrastructureDirectory(
  infraDir: string,
): Promise<boolean> {
  if (!(await dirExists(infraDir))) {
    logDebug("Infrastructure directory does not exist:", infraDir);
    return false;
  }

  if (await dirExists(join(infraDir, "environments"))) {
    logDebug("Validated infrastructure directory:", infraDir);
    return true;
  }

  logDebug("Infrastructure directory missing required indicators:", infraDir);
  return false;
}

/**
 * Detect available environments from infrastructure directory
 */
export async function detectAvailableEnvironments(
  infraDir?: string,
): Promise<string[]> {
  const dir = infraDir ?? (await findInfrastructureDirectory());

  if (!dir) {
    logDebug(
      "Could not find infrastructure directory for environment detection",
    );
    return [];
  }

  const environmentsDir = join(dir, "environments");
  if (!(await dirExists(environmentsDir))) {
    logDebug("No environments directory found in:", dir);
    return [];
  }

  logDebug("Detecting environments in:", environmentsDir);

  const environments: string[] = [];

  try {
    const entries = await readdir(environmentsDir, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isDirectory()) {
        logDebug("Found environment:", entry.name);
        environments.push(entry.name);
      }
    }
  } catch {
    logDebug("Failed to read environments directory");
    return [];
  }

  return environments.toSorted();
}
