/**
 * Platform detection utilities for NS Dojo platform TypeScript scripts
 */

export type OS = "darwin" | "linux" | "win32";

/**
 * Check if running on macOS
 */
export function isMacOS(): boolean {
  return process.platform === "darwin";
}

/**
 * Check if running on Linux
 */
export function isLinux(): boolean {
  return process.platform === "linux";
}

/**
 * Check if running on Windows
 */
export function isWindows(): boolean {
  return process.platform === "win32";
}

/**
 * Get platform-specific command
 */
export function getPlatformCommand(
  macosCmd: string,
  linuxCmd: string,
  windowsCmd?: string,
): string {
  if (isMacOS()) {
    return macosCmd;
  } else if (isWindows() && windowsCmd) {
    return windowsCmd;
  }
  return linuxCmd;
}

/**
 * Get current OS
 */
export function getOS(): OS {
  return process.platform as OS;
}
