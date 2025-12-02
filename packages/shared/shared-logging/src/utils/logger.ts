import type {Logger} from "../function-types.js";
import type {LoggerConfig, LogLevel} from "../types.js";

interface LoggerState {
  prefix: string;
  level: LogLevel;
  timestamp: boolean;
}

function createLoggerState(config: LoggerConfig = {}): LoggerState {
  return {
    prefix: config.prefix ?? "",
    level: config.level ?? "info",
    timestamp: config.timestamp ?? false,
  };
}

function shouldLog(currentLevel: LogLevel, messageLevel: LogLevel): boolean {
  const levels = ["debug", "info", "warn", "error"];
  return levels.indexOf(messageLevel) >= levels.indexOf(currentLevel);
}

function formatMessage(
  state: LoggerState,
  level: string,
  message: string,
): string {
  const timestamp = state.timestamp ? `[${new Date().toISOString()}] ` : "";
  const prefix = state.prefix ? `${state.prefix}: ` : "";
  return `${timestamp}[${level.toUpperCase()}] ${prefix}${message}`;
}

function createDebugLogger(state: LoggerState) {
  return (message: string, ...args: unknown[]): void => {
    if (shouldLog(state.level, "debug")) {
      console.debug(formatMessage(state, "debug", message), ...args);
    }
  };
}

function createInfoLogger(state: LoggerState) {
  return (message: string, ...args: unknown[]): void => {
    if (shouldLog(state.level, "info")) {
      console.log(formatMessage(state, "info", message), ...args);
    }
  };
}

function createWarnLogger(state: LoggerState) {
  return (message: string, ...args: unknown[]): void => {
    if (shouldLog(state.level, "warn")) {
      console.warn(formatMessage(state, "warn", message), ...args);
    }
  };
}

function createErrorLogger(state: LoggerState) {
  return (message: string, ...args: unknown[]): void => {
    if (shouldLog(state.level, "error")) {
      console.error(formatMessage(state, "error", message), ...args);
    }
  };
}

export function createLogger(config: LoggerConfig = {}): Logger {
  const state = createLoggerState(config);

  return {
    debug: createDebugLogger(state),
    info: createInfoLogger(state),
    warn: createWarnLogger(state),
    error: createErrorLogger(state),
  };
}

export const logger = createLogger();

export function createModuleLogger(
  moduleName: string,
  config: LoggerConfig = {},
): Logger {
  return createLogger({
    ...config,
    prefix: moduleName,
  });
}
