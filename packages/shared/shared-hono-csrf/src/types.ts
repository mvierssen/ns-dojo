/**
 * Configuration for Hono CSRF protection
 */
export interface HonoCsrfConfig {
  /** Secret key for HMAC signing */
  secret: string;
  /** Cookie name for storing CSRF token (default: "__csrf") */
  cookieName?: string;
  /** Header name for CSRF token (default: "x-csrf-token") */
  headerName?: string;
  /** Form field name for CSRF token (default: "_csrf") */
  fieldName?: string;
  /** Token length in bytes (default: 32) */
  tokenLength?: number;
}
