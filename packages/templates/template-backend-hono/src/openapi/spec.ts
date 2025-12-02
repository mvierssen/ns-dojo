/**
 * OpenAPI specification generator
 *
 * This module provides OpenAPI 3.1 spec generation and Swagger UI integration
 * for the Hono backend template.
 */

import {createSwaggerUIHandler as createSwaggerUI} from "@ns-dojo/shared-hono";

/**
 * Create Swagger UI handler using Scalar API Reference
 *
 * Provides an interactive documentation interface at /docs
 * that references the OpenAPI spec from /openapi.json
 */
export function createSwaggerUIHandler() {
  return createSwaggerUI({
    url: "/openapi.json",
    theme: "purple",
  });
}
