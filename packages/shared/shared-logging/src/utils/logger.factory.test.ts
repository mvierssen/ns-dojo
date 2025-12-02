import {describe, expect, it} from "vitest";
import {createLogger, createModuleLogger, logger} from "./logger.js";
import {
  mockConsoleDebug,
  mockConsoleLog,
  mockConsoleWarn,
  setupLoggerTests,
  testTimestamp,
} from "./logger.test-utils.js";

describe("Shared Logging - Logger Factory", () => {
  setupLoggerTests();

  describe("Factory Functions", () => {
    describe("createLogger", () => {
      it("should create logger with default config", () => {
        const testLogger = createLogger();

        testLogger.info("test");

        expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] test");
      });

      it("should create logger with custom config", () => {
        const testLogger = createLogger({
          prefix: "Custom",
          level: "warn",
          timestamp: true,
        });

        testLogger.warn("warning");

        expect(mockConsoleWarn).toHaveBeenCalledWith(
          `[${testTimestamp}] [WARN] Custom: warning`,
        );
      });
    });

    describe("createModuleLogger", () => {
      it("should create logger with module name as prefix", () => {
        const moduleLogger = createModuleLogger("UserService");

        moduleLogger.info("user created");

        expect(mockConsoleLog).toHaveBeenCalledWith(
          "[INFO] UserService: user created",
        );
      });

      it("should merge module name with additional config", () => {
        const moduleLogger = createModuleLogger("DatabaseService", {
          level: "debug",
          timestamp: true,
        });

        moduleLogger.debug("query executed");

        expect(mockConsoleDebug).toHaveBeenCalledWith(
          `[${testTimestamp}] [DEBUG] DatabaseService: query executed`,
        );
      });

      it("should handle empty module name", () => {
        const moduleLogger = createModuleLogger("");

        moduleLogger.info("message");

        expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] message");
      });
    });

    describe("default logger", () => {
      it("should provide default logger instance", () => {
        logger.info("default logger test");

        expect(mockConsoleLog).toHaveBeenCalledWith(
          "[INFO] default logger test",
        );
      });
    });
  });
});
