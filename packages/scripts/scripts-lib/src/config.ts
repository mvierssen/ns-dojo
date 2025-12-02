/**
 * Configuration management for NS Dojo platform TypeScript scripts
 */

import {exec} from "node:child_process";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {promisify} from "node:util";
import {logDebug, logError, logInfo, logWarning} from "./logging.js";
import {
  detectAvailableEnvironments,
  fileExists,
  findInfrastructureDirectory,
} from "./path-utils.js";

const execAsync = promisify(exec);

/**
 * Load configuration from a file
 * Note: In TypeScript, we parse JSON/YAML instead of sourcing shell files
 */
export async function loadConfig(
  configFile: string,
): Promise<Record<string, unknown>> {
  try {
    if (!(await fileExists(configFile))) {
      return {};
    }

    logDebug(`Loading configuration from: ${configFile}`);

    const content = await readFile(configFile, "utf8");

    // Try JSON first
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      // If not JSON, parse as simple KEY=VALUE format
      const config: Record<string, string> = {};
      const lines = content.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(trimmed);
        if (match) {
          const key = match[1];
          const value = match[2];
          if (key && value !== undefined) {
            // Remove quotes if present
            config[key] = value.replaceAll(/^["']|["']$/g, "");
          }
        }
      }

      return config;
    }
  } catch (error) {
    logError(`Failed to load config from ${configFile}:`, error);
    return {};
  }
}

/**
 * Detect and set KUBECONFIG from infrastructure directory
 */
export async function detectAndSetKubeconfig(): Promise<string | null> {
  // If KUBECONFIG is already set, use it
  if (process.env.KUBECONFIG) {
    logInfo(`Using KUBECONFIG from environment: ${process.env.KUBECONFIG}`);
    return process.env.KUBECONFIG;
  }

  // Find infrastructure directory
  const infraDir = await findInfrastructureDirectory();
  if (!infraDir) {
    logWarning(
      "No infrastructure directory found, cannot auto-detect kubeconfig",
    );
    logWarning("No kubeconfig found. Some validation features may not work.");
    return null;
  }

  logInfo("Searching for kubeconfig in infrastructure directory...");

  // Detect available environments
  const environments = await detectAvailableEnvironments(infraDir);
  if (environments.length === 0) {
    logWarning("Could not detect environments in infrastructure directory");
    logWarning("No kubeconfig found. Some validation features may not work.");
    return null;
  }

  logInfo(`Found environments: ${environments.join(", ")}`);

  // Try environments in preferred order: staging, development, production, then others
  const preferredOrder = ["staging", "development", "production"];
  const allEnvs: string[] = [];

  // Add preferred environments first
  for (const pref of preferredOrder) {
    if (environments.includes(pref)) {
      allEnvs.push(pref);
    }
  }

  // Add remaining environments
  for (const env of environments) {
    if (!allEnvs.includes(env)) {
      allEnvs.push(env);
    }
  }

  // Try to find kubeconfig in environments
  for (const env of allEnvs) {
    const kubeconfigPath = join(infraDir, "environments", env, "kubeconfig");
    if (await fileExists(kubeconfigPath)) {
      process.env.KUBECONFIG = kubeconfigPath;
      logInfo(`Using kubeconfig from ${env} environment: ${kubeconfigPath}`);
      return kubeconfigPath;
    }
  }

  logWarning("No kubeconfig found in any environment directories");
  logWarning("No kubeconfig found. Some validation features may not work.");
  return null;
}

/**
 * SOPS key type
 */
export type SopsKeyType = "private" | "public";

/**
 * Get SOPS key using hierarchical approach:
 * 1. Environment variables
 * 2. Terraform/Tofu output
 * 3. Kubeconfig/infrastructure directory
 * 4. Local files
 */
export async function getSopsKeyHierarchical(
  keyType: SopsKeyType = "private",
  environment = "staging",
): Promise<string | null> {
  logDebug(`Getting SOPS ${keyType} key for environment: ${environment}`);

  // 1. Check environment variables first
  const envKey = getSopsKeyFromEnv(keyType);
  if (envKey) {
    logDebug(`Using ${keyType} key from environment`);
    return envKey;
  }

  // 2. Try terraform/tofu output
  const tfKey = await getSopsKeyFromTerraform(keyType, environment);
  if (tfKey) {
    logDebug(`Retrieved ${keyType} key from terraform/tofu`);
    return tfKey;
  }

  // 3. Try kubeconfig/infrastructure directory
  const k8sKey = await getSopsKeyFromKubeconfig(keyType, environment);
  if (k8sKey) {
    logDebug(`Retrieved ${keyType} key from kubeconfig`);
    return k8sKey;
  }

  // 4. Try local development files
  const localKey = await getSopsKeyFromLocal(keyType);
  if (localKey) {
    logDebug(`Retrieved ${keyType} key from local files`);
    return localKey;
  }

  logError(
    `Could not retrieve SOPS ${keyType} key for environment '${environment}'`,
  );
  return null;
}

/**
 * Get SOPS key from environment variables
 */
function getSopsKeyFromEnv(keyType: SopsKeyType): string | null {
  if (keyType === "private") {
    return process.env.SOPS_AGE_KEY ?? process.env.AGE_KEY ?? null;
  } else {
    return process.env.SOPS_AGE_PUBLIC_KEY ?? null;
  }
}

/**
 * Get SOPS key from terraform/tofu output
 */
export async function getSopsKeyFromTerraform(
  keyType: SopsKeyType,
  environment: string,
): Promise<string | null> {
  const platformRoot = process.env.PLATFORM_ROOT;
  if (!platformRoot) {
    logDebug("PLATFORM_ROOT not set");
    return null;
  }

  const terraformDir = join(
    platformRoot,
    "infrastructures",
    "environments",
    environment,
  );

  if (!(await fileExists(join(terraformDir, "main.tf")))) {
    logDebug(`Terraform directory not found: ${terraformDir}`);
    return null;
  }

  const outputKey =
    keyType === "private" ? "sops_age_private_key_b64" : "sops_age_public_key";

  try {
    // Try tofu first, then terraform as fallback
    let result = "";
    try {
      const {stdout} = await execAsync(`tofu output -raw ${outputKey}`, {
        cwd: terraformDir,
      });
      result = stdout.trim();
    } catch {
      try {
        const {stdout} = await execAsync(`terraform output -raw ${outputKey}`, {
          cwd: terraformDir,
        });
        result = stdout.trim();
      } catch {
        logDebug(
          "Neither tofu nor terraform command found or output not available",
        );
        return null;
      }
    }

    if (!result) {
      logDebug(`Could not retrieve ${outputKey} from terraform/tofu`);
      return null;
    }

    // Decode base64 private key if needed
    if (keyType === "private") {
      const decoded = Buffer.from(result, "base64").toString("utf8");
      if (!decoded) {
        logDebug("Failed to decode base64 private key");
        return null;
      }
      return decoded;
    }

    return result;
  } catch (error) {
    logDebug(`Error retrieving terraform output: ${String(error)}`);
    return null;
  }
}

/**
 * Get SOPS key from kubeconfig/infrastructure directory
 * Placeholder for future implementation
 */
export async function getSopsKeyFromKubeconfig(
  _keyType: SopsKeyType,
  environment: string,
): Promise<string | null> {
  const platformRoot = process.env.PLATFORM_ROOT;
  if (!platformRoot) {
    return null;
  }

  const kubeconfigPath = join(
    platformRoot,
    "infrastructures",
    "environments",
    environment,
    "kubeconfig",
  );

  if (!(await fileExists(kubeconfigPath))) {
    logDebug(`Kubeconfig not found: ${kubeconfigPath}`);
    return null;
  }

  // For now, this is a placeholder - kubeconfig doesn't typically contain SOPS keys
  // This could be extended to extract keys from cluster secrets or other sources
  logDebug("Kubeconfig key extraction not implemented yet");
  return null;
}

/**
 * Get SOPS key from local development files
 */
export async function getSopsKeyFromLocal(
  keyType: SopsKeyType,
): Promise<string | null> {
  if (keyType === "private") {
    // Check local age keys file
    const homeDir = process.env.HOME ?? process.env.USERPROFILE;
    if (!homeDir) {
      return null;
    }

    const ageKeysFile = join(homeDir, ".config", "sops", "age", "keys.txt");

    if (!(await fileExists(ageKeysFile))) {
      return null;
    }

    try {
      const content = await readFile(ageKeysFile, "utf8");
      const lines = content.split("\n");

      // Get the first age secret key from the file
      for (const line of lines) {
        if (line.includes("AGE-SECRET-KEY")) {
          logDebug("Found age secret key in local file");
          return line.trim();
        }
      }
    } catch (error) {
      logDebug(`Error reading age keys file: ${String(error)}`);
      return null;
    }
  } else {
    // For public keys, we'd need to derive from private key or check .sops.yaml
    // This is more complex and depends on the specific use case
    logDebug("Local public key extraction not implemented yet");
    return null;
  }

  logDebug(`Could not retrieve ${keyType} key from local files`);
  return null;
}
