/**
 * JWT authentication configuration for Hono applications
 */
export interface HonoAuthConfig {
  /** JWT secret key for token verification */
  secret: string;
  /** Optional JWT issuer claim (iss) for validation */
  issuer?: string;
  /** Optional JWT audience claim (aud) for validation - RFC 7519 compliant */
  audience?: string;
}

/**
 * User payload extracted from JWT token
 * Generic TRole allows type-safe role definitions per application
 */
export interface UserPayload<TRole extends string = string> {
  /** User ID (from user_id claim) */
  id: string;
  /** User role (from role claim) */
  role: TRole;
  /** Optional email address */
  email?: string;
  /** Additional claims from JWT payload */
  [key: string]: unknown;
}

/**
 * Hono context variables for authenticated requests
 */
export interface AuthVariables<TRole extends string = string> {
  /** Authenticated user payload */
  user: UserPayload<TRole>;
}

/**
 * Hono context variables for optionally authenticated requests
 */
export interface OptionalAuthVariables<TRole extends string = string> {
  /** User payload if authenticated, undefined otherwise */
  user?: UserPayload<TRole>;
}
