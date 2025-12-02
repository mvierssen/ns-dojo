import {describe, expect, it, vi} from "vitest";
import {createLogger} from "./logger.js";
import {mockConsoleLog, setupLoggerTests} from "./logger.test-utils.js";

describe("Shared Logging - Logger Edge Cases", () => {
  setupLoggerTests();

  describe("Edge Cases", () => {
    it("should handle empty log messages", () => {
      const logger = createLogger();

      logger.info("");

      expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] ");
    });

    it("should handle special characters in messages", () => {
      const logger = createLogger();

      logger.info("Special chars: émojis 🚀 and unicode ñ");

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[INFO] Special chars: émojis 🚀 and unicode ñ",
      );
    });

    it("should handle null and undefined additional arguments", () => {
      const logger = createLogger();

      logger.info("message", null);

      expect(mockConsoleLog).toHaveBeenCalledWith("[INFO] message", null);
    });

    it("should handle very long messages", () => {
      const logger = createLogger();
      const longMessage = "a".repeat(10_000);

      logger.info(longMessage);

      expect(mockConsoleLog).toHaveBeenCalledWith(`[INFO] ${longMessage}`);
    });

    it("should handle different date formats when timestamp is enabled", () => {
      vi.setSystemTime(new Date("2023-12-31T23:59:59.999Z"));
      const logger = createLogger({timestamp: true});

      logger.info("year end message");

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "[2023-12-31T23:59:59.999Z] [INFO] year end message",
      );
    });
  });
});
