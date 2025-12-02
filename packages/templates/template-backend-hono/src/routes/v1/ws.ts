import {createNodeWebSocket} from "@hono/node-ws";
import {Hono} from "hono";
import * as chatWs from "../../ws/chat.ws.js";

/**
 * WebSocket router (v1)
 *
 * Note: WebSocket upgrade is handled by @hono/node-ws
 * The upgrade happens in server.ts via injectWebSocket()
 *
 * This file defines the WebSocket route handlers.
 *
 * IMPORTANT: WebSocket endpoints cannot be fully documented with OpenAPI
 * due to limitations in the OpenAPI 3.1 spec and type incompatibility with
 * the upgradeWebSocket middleware. The routes are kept as standard Hono
 * routes with detailed JSDoc comments for documentation.
 *
 * For API documentation:
 * - Connection protocol: WebSocket (ws:// or wss://)
 * - Upgrade process: HTTP → WebSocket via 101 Switching Protocols
 * - See individual route comments for message formats
 */

/**
 * Create WebSocket helpers
 * This returns both injectWebSocket (for server setup) and upgradeWebSocket (for routes)
 */
const {upgradeWebSocket} = createNodeWebSocket({app: new Hono()});

export const wsRouter = new Hono();

/**
 * WebSocket chat endpoint
 *
 * **Connection:**
 * - Protocol: WebSocket (ws:// or wss://)
 * - Upgrade: HTTP → WebSocket via 101 Switching Protocols
 *
 * **Client → Server Messages:**
 * ```json
 * {
 *   "username": "John",
 *   "content": "Hello, world!",
 *   "timestamp": "2025-11-08T12:00:00Z"
 * }
 * ```
 *
 * **Server → Client Messages:**
 * ```json
 * {
 *   "type": "message",
 *   "from": "John",
 *   "content": "Hello back!",
 *   "timestamp": "2025-11-08T12:00:01Z"
 * }
 * ```
 *
 * **System Messages:**
 * ```json
 * {
 *   "type": "system",
 *   "event": "user_joined",
 *   "username": "John"
 * }
 * ```
 *
 * **Connection URL:**
 * - Development: `ws://localhost:3000/api/v1/ws/chat`
 * - Production: `wss://api.example.com/api/v1/ws/chat`
 *
 * **Client example (JavaScript):**
 * ```js
 * const ws = new WebSocket('ws://localhost:3000/api/v1/ws/chat');
 *
 * ws.onopen = () => {
 *   ws.send(JSON.stringify({
 *     username: 'John',
 *     content: 'Hello, chat!'
 *   }));
 * };
 *
 * ws.onmessage = (event) => {
 *   const message = JSON.parse(event.data);
 *   console.log(message);
 * };
 * ```
 */
wsRouter.get(
  "/chat",
  upgradeWebSocket(() => ({
    onOpen(_evt, ws) {
      chatWs.handleOpen(ws);
    },
    onMessage(event, ws) {
      chatWs.handleMessage(ws, event);
    },
    onClose(_evt, ws) {
      chatWs.handleClose(ws);
    },
    onError(evt, ws) {
      chatWs.handleError(ws, evt);
    },
  })),
);
