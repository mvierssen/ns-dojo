import {describe, expect, it} from "vitest";
import {formatTimestamp} from "./path-utils.js";

describe("Path Utils", () => {
  describe("formatTimestamp", () => {
    it("should return 'never' for null date", () => {
      expect(formatTimestamp(null)).toBe("never");
    });

    it("should format valid date correctly", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const formatted = formatTimestamp(date);

      expect(formatted).toContain("2024");
      expect(formatted).toContain("01");
      expect(formatted).toContain("15");
      expect(formatted).toContain("10:30:00");
    });

    it("should replace T with space", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const formatted = formatTimestamp(date);

      expect(formatted).not.toContain("T");
      expect(formatted).toContain(" ");
    });

    it("should not include milliseconds", () => {
      const date = new Date("2024-01-15T10:30:00.123Z");
      const formatted = formatTimestamp(date);

      expect(formatted).not.toContain(".");
      expect(formatted).not.toContain("123");
    });

    it("should handle different dates consistently", () => {
      const date1 = new Date("2023-12-31T23:59:59.000Z");
      const date2 = new Date("2024-01-01T00:00:00.000Z");

      const formatted1 = formatTimestamp(date1);
      const formatted2 = formatTimestamp(date2);

      expect(formatted1).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      expect(formatted2).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });
  });
});
