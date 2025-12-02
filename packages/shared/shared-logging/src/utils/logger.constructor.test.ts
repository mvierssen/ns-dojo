import {describe, expect, it} from "vitest";
import {createLogger} from "./logger.js";
import {
  mockConsoleDebug,
  mockConsoleLog,
  mockConsoleWarn,
  setupLoggerTests,
  testTimestamp,
} from "./logger.test-utils.js";

describe("Shared Logging - Logger Constructor", () => {
  setupLoggerTests();

  describe("createLogger - Configuration", () => {
    it("should create logger with default configuration", () => {
      const logger = createLogger();

      logger.info("test message");

      expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] test message");
    });

    it("should create logger with custom prefix", () => {
      const logger = createLogger({prefix: "TestModule"});

      logger.info("test message");

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[INFO] TestModule: test message",
      );
    });

    it("should create logger with timestamp enabled", () => {
      const logger = createLogger({timestamp: true});

      logger.info("test message");

      expect(mockConsoleLog).toHaveBeenCalledWith(
        `[${testTimestamp}] [INFO] test message`,
      );
    });

    it("should create logger with custom log level", () => {
      const logger = createLogger({level: "warn"});

      logger.info("info message");
      logger.warn("warn message");

      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith("[WARN] warn message");
    });

    it("should create logger with all options combined", () => {
      const logger = createLogger({
        prefix: "API",
        level: "debug",
        timestamp: true,
      });

      logger.debug("debug message");

      expect(mockConsoleDebug).toHaveBeenCalledWith(
        `[${testTimestamp}] [DEBUG] API: debug message`,
      );
    });
  });
});
