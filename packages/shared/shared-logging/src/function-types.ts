export interface Logger {
  info: (message: string, ...args: readonly unknown[]) => void;
  warn: (message: string, ...args: readonly unknown[]) => void;
  error: (message: string, ...args: readonly unknown[]) => void;
  debug: (message: string, ...args: readonly unknown[]) => void;
}
