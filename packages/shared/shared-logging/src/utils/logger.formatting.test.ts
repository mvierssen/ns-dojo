import {describe, expect, it} from "vitest";
import {createLogger} from "./logger.js";
import {
  mockConsoleError,
  mockConsoleLog,
  mockConsoleWarn,
  setupLoggerTests,
  testTimestamp,
} from "./logger.test-utils.js";

describe("Shared Logging - Logger Formatting", () => {
  setupLoggerTests();

  describe("createLogger - Message Formatting", () => {
    it("should format messages with correct case", () => {
      const logger = createLogger();

      logger.info("message");
      logger.warn("message");
      logger.error("message");

      expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] message");
      expect(mockConsoleWarn).toHaveBeenCalledWith("[WARN] message");
      expect(mockConsoleError).toHaveBeenCalledWith("[ERROR] message");
    });

    it("should handle additional arguments", () => {
      const logger = createLogger();
      const obj = {key: "value"};
      const arr = [1, 2, 3];

      logger.info("message with args", obj, arr);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[INFO] message with args",
        obj,
        arr,
      );
    });

    it("should format complex messages with all options", () => {
      const logger = createLogger({
        prefix: "TestApp",
        timestamp: true,
      });

      logger.info("complex message", {data: "test"});

      expect(mockConsoleLog).toHaveBeenCalledWith(
        `[${testTimestamp}] [INFO] TestApp: complex message`,
        {data: "test"},
      );
    });
  });
});
