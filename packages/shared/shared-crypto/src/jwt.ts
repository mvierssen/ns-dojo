import {jwtVerify, SignJWT} from "jose";
import {createJwtError} from "./errors.js";
import type {JwtConfig, JwtPayload} from "./types.js";

export async function generateToken(
  userId: string,
  role: string,
  config?: Partial<JwtConfig>,
  additionalClaims?: Record<string, unknown>,
): Promise<string> {
  const jwtSecret = config?.secret ?? process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createJwtError("JWT secret not configured", 500);
  }

  const secret = new TextEncoder().encode(jwtSecret);
  const expiresIn = config?.expiresIn ?? "24h";

  const payload: JwtPayload & Record<string, unknown> = {
    user_id: userId,
    role,
    ...additionalClaims,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({alg: "HS256"})
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken<TRole extends string>(
  token: string,
  secret?: string,
): Promise<JwtPayload<TRole>> {
  const jwtSecret = secret ?? process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw createJwtError("JWT secret not configured", 500);
  }

  try {
    const encodedSecret = new TextEncoder().encode(jwtSecret);
    const {payload} = await jwtVerify(token, encodedSecret);
    return payload as unknown as JwtPayload<TRole>;
  } catch {
    throw createJwtError("Invalid token", 401, "INVALID_TOKEN");
  }
}

export function extractBearerToken(authHeader?: string): string {
  if (!authHeader?.startsWith("Bearer ")) {
    throw createJwtError("No token provided", 401, "NO_TOKEN");
  }
  return authHeader.slice(7);
}

export async function extractAndVerifyToken<TRole extends string>(
  authHeader?: string,
  secret?: string,
): Promise<JwtPayload<TRole>> {
  const token = extractBearerToken(authHeader);
  return await verifyToken<TRole>(token, secret);
}
