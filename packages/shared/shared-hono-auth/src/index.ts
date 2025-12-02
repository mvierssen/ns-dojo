// Main authentication middleware
export {
  authMiddleware,
  getUser,
  optionalAuthMiddleware,
  requireRole,
} from "./auth.js";

// Validation schemas
export {HonoAuthConfigSchema, UserPayloadSchema} from "./schemas.js";

// TypeScript types
export type {
  AuthVariables,
  HonoAuthConfig,
  OptionalAuthVariables,
  UserPayload,
} from "./types.js";
