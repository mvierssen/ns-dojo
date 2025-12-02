// Error handling utilities
export {
  badRequest,
  createErrorHandler,
  createProblemDetails,
  forbidden,
  internalError,
  mapZodErrors,
  notFound,
  sendProblem,
  unauthorized,
  type ProblemDetails,
} from "./errors.js";

// JWT utilities
export {
  attachJwtUser,
  createJwtMiddleware,
  getJwtPayload,
  getUserId,
  hasRole,
  requireRole,
  type JwtClaims,
  type JwtContext,
  type JwtVariables,
} from "./jwt.js";

// Middleware utilities
export {
  combine,
  conditional,
  getApiVersion,
  onlyPaths,
  parseApiVersion,
  requestId,
  skipMethods,
  skipPaths,
  versionMiddleware,
  type ApiVersion,
  type VersionVariables,
} from "./middleware.js";

// Middleware factories
export {
  createBodyLimitMiddleware,
  createCompressionMiddleware,
  createCorsMiddleware,
  createEtagMiddleware,
  createLoggingMiddleware,
  createLoggingStack,
  createRequestIdMiddleware,
  createSecureHeadersMiddleware,
} from "./middleware-factories.js";

// OpenAPI utilities
export {
  createOpenAPIDocument,
  createSwaggerUIHandler,
  defaultValidationHook,
  type OpenAPIDocumentConfig,
  type SwaggerUIOptions,
} from "./openapi.js";

// Common schemas
export {
  PaginationSchema,
  ProblemDetailsSchema,
  SuccessResponseSchema,
  type Pagination,
  type SuccessResponse,
} from "./schemas.js";

// Server lifecycle
export {
  createServer,
  setupGracefulShutdown,
  type ServerConfig,
} from "./server.js";

// Health checks
export {livenessHandler, readinessHandler, type HealthCheck} from "./health.js";

// Type utilities
export {
  type AppContext,
  type AppEnv,
  type AppVariables,
  type TypedHandler,
  type ValidatedInput,
} from "./types.js";
