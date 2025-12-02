/**
 * SSE (Server-Sent Events) token generator
 *
 * Demonstrates streaming patterns for:
 * - AI token streaming (LLM responses)
 * - Real-time event feeds
 * - Progress updates
 * - Live data streams
 */

/**
 * Simulate AI token generation
 * In production, this would call an LLM API and stream tokens
 */
export async function* generateTokens(prompt: string): AsyncGenerator<string> {
  const tokens = [
    "This",
    " is",
    " a",
    " simulated",
    " AI",
    " response",
    " to",
    " the",
    " prompt:",
    ` "${prompt}"`,
    ".",
    " Each",
    " word",
    " is",
    " streamed",
    " as",
    " a",
    " separate",
    " token",
    " to",
    " demonstrate",
    " SSE",
    " streaming",
    ".",
  ];

  for (const token of tokens) {
    // Simulate network delay
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    yield token;
  }
}

/**
 * Simulate progress updates
 */
export async function* generateProgress(): AsyncGenerator<{
  progress: number;
  message: string;
}> {
  const steps = [
    {progress: 0, message: "Starting..."},
    {progress: 25, message: "Processing data..."},
    {progress: 50, message: "Analyzing results..."},
    {progress: 75, message: "Finalizing..."},
    {progress: 100, message: "Complete!"},
  ];

  for (const step of steps) {
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    yield step;
  }
}
