import type {Context} from "hono";
import type {z} from "zod";

/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  /** A URI reference that identifies the problem type */
  type: string;
  /** A short, human-readable summary of the problem type */
  title: string;
  /** The HTTP status code */
  status: number;
  /** A human-readable explanation specific to this occurrence */
  detail?: string;
  /** A URI reference that identifies the specific occurrence */
  instance?: string;
  /** Validation issues from Zod or other validators */
  issues?: {
    path: string[];
    message: string;
    code?: string;
  }[];
  /** Additional context-specific properties */
  [key: string]: unknown;
}

/**
 * Map Zod validation errors to our issues format
 */
export function mapZodErrors(error: z.ZodError): ProblemDetails["issues"] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Create a standard error response
 */
export function createProblemDetails(
  status: number,
  title: string,
  detail?: string,
  type?: string,
  issues?: ProblemDetails["issues"],
): ProblemDetails {
  return {
    type: type ?? `https://httpstatuses.com/${String(status)}`,
    title,
    status,
    detail,
    issues,
  };
}

/**
 * Send a problem details response
 */
export function sendProblem(c: Context, problem: ProblemDetails): Response {
  // Add instance from request path if not already set
  problem.instance ??= c.req.path;
  return Response.json(problem, {
    status: problem.status,
  });
}

/**
 * Create a 400 Bad Request response from Zod errors
 */
export function badRequest(
  c: Context,
  error: z.ZodError,
  detail = "Request validation failed",
): Response {
  return sendProblem(
    c,
    createProblemDetails(
      400,
      "Bad Request",
      detail,
      "about:blank#bad-request",
      mapZodErrors(error),
    ),
  );
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorized(
  c: Context,
  detail = "Authentication required",
): Response {
  return sendProblem(
    c,
    createProblemDetails(
      401,
      "Unauthorized",
      detail,
      "about:blank#unauthorized",
    ),
  );
}

/**
 * Create a 403 Forbidden response
 */
export function forbidden(
  c: Context,
  detail = "Insufficient permissions",
): Response {
  return sendProblem(
    c,
    createProblemDetails(403, "Forbidden", detail, "about:blank#forbidden"),
  );
}

/**
 * Create a 404 Not Found response
 */
export function notFound(c: Context, detail = "Resource not found"): Response {
  return sendProblem(
    c,
    createProblemDetails(404, "Not Found", detail, "about:blank#not-found"),
  );
}

/**
 * Create a 500 Internal Server Error response
 */
export function internalError(
  c: Context,
  detail = "An unexpected error occurred",
): Response {
  return sendProblem(
    c,
    createProblemDetails(
      500,
      "Internal Server Error",
      detail,
      "about:blank#internal-error",
    ),
  );
}

/**
 * Global error handler factory for Hono
 */
export function createErrorHandler(options?: {
  logErrors?: boolean;
  includeStackTrace?: boolean;
}) {
  const {logErrors = true, includeStackTrace = false} = options ?? {};

  return (err: Error, c: Context): Response => {
    if (logErrors) {
      console.error("Error:", err);
    }

    // Handle Zod errors
    if ("issues" in err && Array.isArray(err.issues)) {
      return badRequest(c, err as z.ZodError);
    }

    // Handle custom HTTP errors (if they have a status property)
    if ("status" in err && typeof err.status === "number") {
      const status = err.status;
      const detail = err.message;

      return sendProblem(
        c,
        createProblemDetails(
          status,
          err.name,
          detail,
          undefined,
          includeStackTrace && err.stack
            ? [{path: [], message: err.stack}]
            : undefined,
        ),
      );
    }

    // Default to 500 Internal Server Error
    return internalError(c, includeStackTrace ? err.message : undefined);
  };
}
