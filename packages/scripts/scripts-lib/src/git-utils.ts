/**
 * Git utilities for NS Dojo platform TypeScript scripts
 */

import {exec} from "node:child_process";
import {promisify} from "node:util";

const execAsync = promisify(exec);

/**
 * Check if a branch exists locally
 */
export async function gitBranchExistsLocal(branch: string): Promise<boolean> {
  try {
    await execAsync(`git rev-parse --verify ${branch}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a branch exists on remote
 */
export async function gitBranchExistsRemote(
  remote: string,
  branch: string,
): Promise<boolean> {
  try {
    await execAsync(`git ls-remote --exit-code --heads ${remote} ${branch}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current git branch name
 */
export async function gitCurrentBranch(): Promise<string> {
  try {
    const {stdout} = await execAsync("git branch --show-current");
    return stdout.trim();
  } catch {
    return "";
  }
}
