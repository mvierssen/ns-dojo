import {createRoute, OpenAPIHono, z} from "@hono/zod-openapi";
import {streamSSE} from "hono/streaming";
import {defaultHook} from "../../openapi/config.js";
import {ProblemDetailsSchema} from "../../schemas/common.js";
import {generateProgress, generateTokens} from "../../sse/stream.sse.js";

/**
 * SSE (Server-Sent Events) streaming router (v1)
 *
 * Demonstrates:
 * - Real-time event streaming
 * - AI token streaming pattern
 * - Progress updates
 * - Proper SSE headers and format
 *
 * Client example (JavaScript):
 * ```js
 * const events = new EventSource('/api/v1/stream/ai?prompt=Hello');
 *
 * events.addEventListener('token', (e) => {
 *   console.log('Token:', e.data);
 * });
 *
 * events.addEventListener('end', () => {
 *   console.log('Stream complete');
 *   events.close();
 * });
 * ```
 */

export const streamRouter = new OpenAPIHono({defaultHook});

/**
 * OpenAPI route definition for AI token streaming
 */
const streamTokensRoute = createRoute({
  method: "get",
  path: "/ai",
  tags: ["Streaming"],
  summary: "Stream AI tokens",
  description: `Server-Sent Events endpoint that streams AI-generated tokens in real-time.

**Event Format:**
- Event type: \`start\`, \`token\`, or \`end\`
- Data format: JSON object with event-specific fields
- Connection: Keep-alive with automatic reconnection

**Example Events:**
\`\`\`
event: start
data: {"message": "Starting AI generation", "prompt": "Hello"}

event: token
data: "Hello"

event: token
data: " world"

event: end
data: {"message": "Generation complete"}
\`\`\``,
  operationId: "streamTokens",
  request: {
    query: z.object({
      prompt: z.string().min(1).default("Hello, world!").openapi({
        description: "Prompt for AI token generation",
        example: "Tell me a story",
      }),
    }),
    headers: z.object({
      "x-api-version": z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "SSE stream of generated tokens",
      content: {
        "text/event-stream": {
          schema: z
            .object({
              event: z.enum(["start", "token", "end"]).openapi({
                description: "Event type",
              }),
              data: z
                .union([
                  z.object({
                    message: z.string(),
                    prompt: z.string().optional(),
                  }),
                  z.string(),
                ])
                .openapi({
                  description: "Event data (structure varies by event type)",
                }),
            })
            .openapi({
              description: "Server-Sent Event message format",
            }),
        },
      },
      headers: z.object({
        "Content-Type": z.string().openapi({example: "text/event-stream"}),
        "Cache-Control": z.string().openapi({example: "no-cache"}),
        Connection: z.string().openapi({example: "keep-alive"}),
      }),
    },
    400: {
      description: "Bad request - invalid prompt",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
  },
});

/**
 * Stream AI tokens (simulated LLM response)
 */
streamRouter.openapi(streamTokensRoute, (c) => {
  const {prompt} = c.req.valid("query");

  return streamSSE(c, async (stream) => {
    // Send initial event
    await stream.writeSSE({
      event: "start",
      data: JSON.stringify({
        message: "Starting AI generation",
        prompt,
      }),
    });

    // Stream tokens
    for await (const token of generateTokens(prompt)) {
      await stream.writeSSE({
        event: "token",
        data: token,
      });
    }

    // Send completion event
    await stream.writeSSE({
      event: "end",
      data: JSON.stringify({
        message: "Generation complete",
      }),
    });
  });
});

/**
 * OpenAPI route definition for progress streaming
 */
const streamProgressRoute = createRoute({
  method: "get",
  path: "/progress",
  tags: ["Streaming"],
  summary: "Stream progress updates",
  description: `Server-Sent Events endpoint for real-time progress tracking.

**Event Format:**
- Event type: \`progress\`
- Data format: JSON with \`progress\`, \`message\`

**Example Events:**
\`\`\`
event: progress
data: {"progress": 25, "message": "Processing..."}

event: progress
data: {"progress": 50, "message": "Halfway there..."}

event: progress
data: {"progress": 100, "message": "Complete"}
\`\`\``,
  operationId: "streamProgress",
  request: {
    headers: z.object({
      "x-api-version": z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "SSE stream of progress updates",
      content: {
        "text/event-stream": {
          schema: z
            .object({
              event: z.literal("progress").openapi({
                description: "Event type",
              }),
              data: z.object({
                progress: z.number().int().min(0).max(100).openapi({
                  description: "Progress percentage",
                  example: 50,
                }),
                message: z.string().openapi({
                  description: "Progress status message",
                  example: "Processing...",
                }),
              }),
            })
            .openapi({
              description: "Server-Sent Event message format",
            }),
        },
      },
      headers: z.object({
        "Content-Type": z.string().openapi({example: "text/event-stream"}),
        "Cache-Control": z.string().openapi({example: "no-cache"}),
        Connection: z.string().openapi({example: "keep-alive"}),
      }),
    },
  },
});

/**
 * Stream progress updates
 */
streamRouter.openapi(streamProgressRoute, (c) => {
  return streamSSE(c, async (stream) => {
    for await (const update of generateProgress()) {
      await stream.writeSSE({
        event: "progress",
        data: JSON.stringify(update),
      });

      // Exit early on completion
      if (update.progress === 100) {
        break;
      }
    }
  });
});
