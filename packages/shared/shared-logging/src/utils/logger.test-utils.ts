import {afterEach, beforeEach, vi, type Mock} from "vitest";

export const mockConsoleLog: Mock = vi.fn();
export const mockConsoleWarn: Mock = vi.fn();
export const mockConsoleError: Mock = vi.fn();
export const mockConsoleDebug: Mock = vi.fn();

vi.stubGlobal("console", {
  log: mockConsoleLog,
  warn: mockConsoleWarn,
  error: mockConsoleError,
  debug: mockConsoleDebug,
});

export const setupLoggerTests = () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
};

export const testTimestamp = "2024-01-01T12:00:00.000Z";
export const testDate = new Date(testTimestamp);
