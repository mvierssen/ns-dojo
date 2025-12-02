import {createSecureHeadersMiddleware} from "@ns-dojo/shared-hono";

/**
 * Secure headers middleware (Helmet-like for Hono)
 *
 * Sets OWASP-recommended security headers:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY (prevents clickjacking)
 * - X-XSS-Protection: 1; mode=block
 * - Strict-Transport-Security (HSTS)
 * - Content-Security-Policy (CSP)
 * - Referrer-Policy
 *
 * Tune CSP and referrer policy for your application's needs.
 *
 * Production considerations:
 * - Adjust CSP directives based on your frontend assets
 * - Consider using nonces or hashes for inline scripts
 * - Add HSTS preload directive after testing
 */
export const secureHeadersMiddleware = createSecureHeadersMiddleware({
  // Content Security Policy - restrict resource loading
  // This is a strict baseline; adjust for your needs
  // Note: Scalar API Reference requires 'unsafe-eval' and 'wasm-unsafe-eval'
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // Required for Scalar API Reference
      "'wasm-unsafe-eval'", // Required for WebAssembly in Scalar
      "https://cdn.jsdelivr.net",
    ],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: [
      "'self'",
      "https://cdn.jsdelivr.net",
      "https://fonts.scalar.com", // Scalar API Reference fonts
    ],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"], // Equivalent to X-Frame-Options: DENY
    upgradeInsecureRequests: [],
  },

  // Referrer Policy - control referrer information
  // "strict-origin-when-cross-origin" is a good balance
  referrerPolicy: "strict-origin-when-cross-origin",

  // Strict-Transport-Security - enforce HTTPS (production only)
  // Enable in production with HTTPS:
  // strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
});
