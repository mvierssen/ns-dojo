import {Scalar} from "@scalar/hono-api-reference";
import type {Handler} from "hono";

/**
 * Default hook for OpenAPI validation errors
 *
 * Formats validation errors in RFC 7807 Problem Details format
 * Use this with OpenAPIHono's defaultHook option
 *
 * @example
 * ```ts
 * const app = new OpenAPIHono({ defaultHook: defaultValidationHook });
 * ```
 */
export const defaultValidationHook = (
  result: unknown,
  c: {json: (data: unknown, status: number) => unknown; req: {path: string}},
) => {
  if (
    result &&
    typeof result === "object" &&
    "success" in result &&
    !result.success &&
    "error" in result
  ) {
    const error = result.error as {
      issues: {path: (string | number)[]; message: string; code: string}[];
    };
    return c.json(
      {
        type: "about:blank#bad-request",
        title: "Bad Request",
        status: 400,
        detail: "Request validation failed",
        instance: c.req.path,
        issues: error.issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
          code: issue.code,
        })),
      },
      400,
    );
  }
};

/**
 * Configuration for OpenAPI document generation
 */
export interface OpenAPIDocumentConfig {
  /** API title */
  title: string;
  /** API version */
  version: string;
  /** API description */
  description: string;
  /** Contact information */
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  /** License information */
  license?: {
    name: string;
    url?: string;
  };
  /** Server configurations */
  servers?: {
    url: string;
    description: string;
  }[];
}

/**
 * Create OpenAPI 3.1 specification document
 *
 * Provides a base OpenAPI spec with common response schemas
 * Route-specific documentation will be added by OpenAPIHono
 *
 * @example
 * ```ts
 * app.doc('/openapi.json', createOpenAPIDocument({
 *   title: 'My API',
 *   version: '1.0.0',
 *   description: 'My API description',
 * }));
 * ```
 */
export function createOpenAPIDocument(config: OpenAPIDocumentConfig) {
  return {
    openapi: "3.1.0",
    info: {
      title: config.title,
      version: config.version,
      description: config.description,
      contact: config.contact,
      license: config.license ?? {
        name: "MIT",
      },
    },
    servers: config.servers ?? [
      {
        url: "http://localhost:3000",
        description: "Development",
      },
    ],
    paths: {},
    components: {
      schemas: {},
      parameters: {
        ApiVersion: {
          name: "x-api-version",
          in: "header",
          description: "API version (v1, v2)",
          required: false,
          schema: {
            type: "string",
            example: "v1",
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Bad Request - Invalid input data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {type: "string"},
                  title: {type: "string"},
                  status: {type: "number"},
                  detail: {type: "string"},
                  instance: {type: "string"},
                },
                required: ["type", "title", "status"],
              },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized - Authentication required",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {type: "string"},
                  title: {type: "string"},
                  status: {type: "number"},
                  detail: {type: "string"},
                  instance: {type: "string"},
                },
                required: ["type", "title", "status"],
              },
            },
          },
        },
        Forbidden: {
          description: "Forbidden - Insufficient permissions",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {type: "string"},
                  title: {type: "string"},
                  status: {type: "number"},
                  detail: {type: "string"},
                  instance: {type: "string"},
                },
                required: ["type", "title", "status"],
              },
            },
          },
        },
        NotFound: {
          description: "Not Found - Resource does not exist",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {type: "string"},
                  title: {type: "string"},
                  status: {type: "number"},
                  detail: {type: "string"},
                  instance: {type: "string"},
                },
                required: ["type", "title", "status"],
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal Server Error - Unexpected error occurred",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: {type: "string"},
                  title: {type: "string"},
                  status: {type: "number"},
                  detail: {type: "string"},
                  instance: {type: "string"},
                },
                required: ["type", "title", "status"],
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Configuration for Swagger UI handler
 */
export interface SwaggerUIOptions {
  /** URL to the OpenAPI spec */
  url?: string;
  /** Theme for Scalar API Reference */
  theme?:
    | "default"
    | "purple"
    | "alternate"
    | "moon"
    | "solarized"
    | "bluePlanet"
    | "deepSpace"
    | "saturn"
    | "kepler"
    | "elysiajs"
    | "fastify"
    | "mars"
    | "laserwave"
    | "none";
}

/**
 * Create Swagger UI handler using Scalar API Reference
 *
 * Provides an interactive documentation interface
 * that references the OpenAPI spec
 *
 * @example
 * ```ts
 * app.get('/docs', createSwaggerUIHandler({ url: '/openapi.json' }));
 * ```
 */
export function createSwaggerUIHandler(options?: SwaggerUIOptions): Handler {
  const {url = "/openapi.json", theme = "purple"} = options ?? {};

  return Scalar({
    url,
    theme,
  });
}
