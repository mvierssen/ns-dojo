/**
 * Error handling utilities for NS Dojo platform TypeScript scripts
 */

import {exec} from "node:child_process";
import {stat} from "node:fs/promises";
import {promisify} from "node:util";
import {logError} from "./logging.js";

const execAsync = promisify(exec);

/**
 * Exit with error message and optional exit code
 */
export function die(message: string, exitCode = 1): never {
  logError(message);
  process.exit(exitCode);
}

/**
 * Check if command exists
 */
export async function requireCommand(
  cmd: string,
  packageName?: string,
): Promise<void> {
  try {
    const whichCmd = process.platform === "win32" ? "where" : "which";
    await execAsync(`${whichCmd} ${cmd}`);
  } catch {
    die(
      `Required command '${cmd}' not found. Please install ${packageName ?? cmd}.`,
    );
  }
}

/**
 * Check if file exists
 */
export async function requireFile(
  file: string,
  description = "file",
): Promise<void> {
  try {
    const stats = await stat(file);
    if (!stats.isFile()) {
      die(`Required ${description} is not a file: ${file}`);
    }
  } catch {
    die(`Required ${description} not found: ${file}`);
  }
}

/**
 * Check if directory exists
 */
export async function requireDirectory(
  dir: string,
  description = "directory",
): Promise<void> {
  try {
    const stats = await stat(dir);
    if (!stats.isDirectory()) {
      die(`Required ${description} is not a directory: ${dir}`);
    }
  } catch {
    die(`Required ${description} not found: ${dir}`);
  }
}

/**
 * Validate that a value is in an array
 */
export function validateInArray<T>(value: T, array: T[]): boolean {
  return array.includes(value);
}

/**
 * Validate that a variable is a boolean
 */
export function validateBoolean(
  value: unknown,
  varName: string,
): asserts value is boolean {
  if (typeof value !== "boolean") {
    die(
      `Invalid boolean value for ${varName}: '${String(value)}' (must be true or false)`,
    );
  }
}

/**
 * Validate repository exists and is a git repository
 */
export async function validateRepository(
  repo: string,
  platformRoot?: string,
): Promise<boolean> {
  const {getPlatformRoot} = await import("./path-utils.js");
  const root = platformRoot ?? (await getPlatformRoot());
  const repoPath = `${root}/${repo}`;

  try {
    const stats = await stat(repoPath);
    if (!stats.isDirectory()) {
      logError(`Repository '${repo}' does not exist at ${repoPath}`);
      return false;
    }
  } catch {
    logError(`Repository '${repo}' does not exist at ${repoPath}`);
    return false;
  }

  // Check if it's a git repository
  try {
    const gitPath = `${repoPath}/.git`;
    await stat(gitPath);
    return true;
  } catch {
    logError(`Repository '${repo}' is not a git repository`);
    return false;
  }
}
