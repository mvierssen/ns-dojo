import type {WSContext} from "hono/ws";

/**
 * WebSocket chat room
 *
 * Demonstrates:
 * - Real-time bidirectional communication
 * - Broadcasting to multiple clients
 * - Connection management
 * - Message handling
 *
 * Production considerations:
 * - Add authentication (validate JWT before upgrade)
 * - Implement rooms/channels
 * - Persist messages to database
 * - Add rate limiting per connection
 * - Handle reconnection logic
 * - Scale with Redis pub/sub for multi-instance deployments
 */

interface ChatMessage {
  type: "message" | "join" | "leave" | "error";
  username?: string;
  content?: string;
  timestamp: string;
}

// Store active connections
const connections = new Set<WSContext>();

/**
 * Broadcast a message to all connected clients
 */
function broadcast(message: ChatMessage): void {
  const payload = JSON.stringify(message);

  for (const ws of connections) {
    try {
      ws.send(payload);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove failed connection
      connections.delete(ws);
    }
  }
}

/**
 * Handle new WebSocket connection
 */
export function handleOpen(ws: WSContext): void {
  connections.add(ws);

  const joinMessage: ChatMessage = {
    type: "join",
    content: "A user joined the chat",
    timestamp: new Date().toISOString(),
  };

  broadcast(joinMessage);

  // Send welcome message to the new user
  ws.send(
    JSON.stringify({
      type: "message",
      content: `Welcome to the chat! Connected users: ${String(connections.size)}`,
      timestamp: new Date().toISOString(),
    }),
  );
}

/**
 * Handle incoming messages
 */
export function handleMessage(ws: WSContext, event: MessageEvent): void {
  try {
    const data = JSON.parse(String(event.data)) as {
      username?: string;
      content?: unknown;
    };

    // Validate message format
    if (!data.content || typeof data.content !== "string") {
      ws.send(
        JSON.stringify({
          type: "error",
          content: "Invalid message format",
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }

    // Broadcast the message to all clients
    const message: ChatMessage = {
      type: "message",
      username: data.username ?? "Anonymous",
      content: data.content,
      timestamp: new Date().toISOString(),
    };

    broadcast(message);
  } catch (error) {
    console.error("Error parsing message:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        content: "Failed to parse message",
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

/**
 * Handle connection close
 */
export function handleClose(ws: WSContext): void {
  connections.delete(ws);

  const leaveMessage: ChatMessage = {
    type: "leave",
    content: "A user left the chat",
    timestamp: new Date().toISOString(),
  };

  broadcast(leaveMessage);
}

/**
 * Handle connection error
 */
export function handleError(ws: WSContext, error: Event): void {
  console.error("WebSocket error:", error);
  connections.delete(ws);
}
