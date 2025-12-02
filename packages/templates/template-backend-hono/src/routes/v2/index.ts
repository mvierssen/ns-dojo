import {Hono} from "hono";

/**
 * API v2 router (placeholder)
 *
 * This is a placeholder for future v2 endpoints.
 * Header-based versioning allows you to evolve the API
 * while maintaining backward compatibility.
 *
 * Example usage:
 * ```ts
 * export const v2Router = new Hono();
 *
 * // Add v2-specific routes
 * v2Router.get('/items', itemsV2Controller.listItems);
 * ```
 */

export const v2Router = new Hono();

v2Router.get("/", (c) => {
  return c.json({
    version: "v2",
    message: "API v2 - Coming soon",
    timestamp: new Date().toISOString(),
  });
});
