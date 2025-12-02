/**
 * Progress and status utilities for NS Dojo platform TypeScript scripts
 */

/**
 * Show a progress bar in the terminal
 */
export function showProgress(
  current: number,
  total: number,
  description = "Processing",
  width = 50,
): void {
  const percentage = Math.floor((current * 100) / total);
  const filled = Math.floor((current * width) / total);
  const empty = width - filled;

  const bar = "=".repeat(filled) + "-".repeat(empty);
  const progressText = `\r${description}: [${bar}] ${String(percentage)}% (${String(current)}/${String(total)})`;

  process.stdout.write(progressText);

  if (current === total) {
    process.stdout.write("\n"); // New line when complete
  }
}

/**
 * Set up cleanup handler for process exit/interruption
 */
export function setupCleanup(
  cleanupFunction: () => void | Promise<void>,
): void {
  const cleanup = async () => {
    try {
      await cleanupFunction();
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  process.on("exit", () => {
    void cleanup();
  });

  process.on("SIGINT", () => {
    void cleanup().then(() => process.exit(130));
  });

  process.on("SIGTERM", () => {
    void cleanup().then(() => process.exit(143));
  });
}

/**
 * Create a simple spinner
 */
export class Spinner {
  private frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  private currentFrame = 0;
  private interval: NodeJS.Timeout | null = null;
  private text: string;

  constructor(text = "Loading") {
    this.text = text;
  }

  start(): void {
    this.interval = setInterval(() => {
      process.stdout.write(
        `\r${this.frames[this.currentFrame] ?? ""} ${this.text}`,
      );
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 80);
  }

  stop(finalText?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r${finalText ?? this.text}\n`);
  }

  succeed(text?: string): void {
    this.stop(`✓ ${text ?? this.text}`);
  }

  fail(text?: string): void {
    this.stop(`✗ ${text ?? this.text}`);
  }
}
