import {describe, expect, it} from "vitest";
import {createLogger} from "./logger.js";
import {
  mockConsoleDebug,
  mockConsoleError,
  mockConsoleLog,
  mockConsoleWarn,
  setupLoggerTests,
} from "./logger.test-utils.js";

describe("Shared Logging - Logger Levels", () => {
  setupLoggerTests();

  describe("createLogger - Log Level Filtering", () => {
    it("should respect debug level (logs everything)", () => {
      const logger = createLogger({level: "debug"});

      logger.debug("debug");
      logger.info("info");
      logger.warn("warn");
      logger.error("error");

      expect(mockConsoleDebug).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should respect info level (logs info, warn, error)", () => {
      const logger = createLogger({level: "info"});

      logger.debug("debug");
      logger.info("info");
      logger.warn("warn");
      logger.error("error");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should respect warn level (logs warn, error)", () => {
      const logger = createLogger({level: "warn"});

      logger.debug("debug");
      logger.info("info");
      logger.warn("warn");
      logger.error("error");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it("should respect error level (logs only error)", () => {
      const logger = createLogger({level: "error"});

      logger.debug("debug");
      logger.info("info");
      logger.warn("warn");
      logger.error("error");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe("createLogger - Debug Method", () => {
    it("should call console.debug when level allows", () => {
      const logger = createLogger({level: "debug"});

      logger.debug("debug message");

      expect(mockConsoleDebug).toHaveBeenCalledWith("[DEBUG] debug message");
    });

    it("should not call console.debug when level is higher", () => {
      const logger = createLogger({level: "info"});

      logger.debug("debug message");

      expect(mockConsoleDebug).not.toHaveBeenCalled();
    });
  });
});
