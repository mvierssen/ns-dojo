import {OpenAPIHono} from "@hono/zod-openapi";
import {defaultHook} from "../../openapi/config.js";
import {itemsRouter} from "./items.js";
import {streamRouter} from "./stream.js";
import {uploadRouter} from "./upload.js";
import {wsRouter} from "./ws.js";

/**
 * API v1 router
 *
 * Mounts all v1 routes under /api/v1
 *
 * Routes:
 * - /api/v1/items/*    - CRUD operations
 * - /api/v1/stream/*   - SSE streaming
 * - /api/v1/ws/*       - WebSocket endpoints
 * - /api/v1/upload     - File uploads
 */

export const v1Router = new OpenAPIHono({defaultHook});

// Mount sub-routers
v1Router.route("/items", itemsRouter);
v1Router.route("/stream", streamRouter);
v1Router.route("/ws", wsRouter);
v1Router.route("/upload", uploadRouter);
