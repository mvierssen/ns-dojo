import {randomBytes} from "node:crypto";
import type {CsrfConfig, ParsedToken, ValidationResult} from "./types.js";
import {
  createHmacSignature,
  createSessionMessage,
  timingSafeEqual,
} from "./utils.js";

function getDefaultConfig(): CsrfConfig {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error(
      "CSRF_SECRET environment variable is required. Please set it to a secure random string.",
    );
  }
  return {
    secret,
    tokenLength: 32,
  };
}

export function parseToken(token: string): ParsedToken | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [hmac, randomValue] = parts;
  if (!hmac || !randomValue) {
    return null;
  }

  return {hmac, randomValue};
}

export function generateCsrfToken(
  sessionId: string,
  config?: CsrfConfig,
): string {
  const resolvedConfig = config ?? getDefaultConfig();
  if (!sessionId) {
    throw new Error("Session ID is required for CSRF token generation");
  }

  try {
    const randomValue = randomBytes(resolvedConfig.tokenLength).toString("hex");

    const message = createSessionMessage(sessionId, randomValue);

    const hmac = createHmacSignature(message, resolvedConfig.secret);

    return `${hmac}.${randomValue}`;
  } catch (error) {
    throw new Error(
      `Failed to generate CSRF token: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function validateCsrfToken(
  token: string,
  sessionId: string,
  config?: CsrfConfig,
): ValidationResult {
  try {
    const resolvedConfig = config ?? getDefaultConfig();

    if (!token || !sessionId) {
      return {
        valid: false,
        error: "Token and session ID are required",
      };
    }

    const parsed = parseToken(token);
    if (!parsed) {
      return {
        valid: false,
        error: "Invalid token format",
      };
    }

    const {hmac: receivedHmac, randomValue} = parsed;

    const message = createSessionMessage(sessionId, randomValue);

    const expectedHmac = createHmacSignature(message, resolvedConfig.secret);

    const isValid = timingSafeEqual(receivedHmac, expectedHmac);

    return {
      valid: isValid,
      error: isValid ? undefined : "Invalid token signature",
    };
  } catch (error) {
    return {
      valid: false,
      error: `Token validation error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
