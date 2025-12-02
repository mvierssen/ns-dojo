import {describe, expect, it, vi} from "vitest";
import {die, validateBoolean, validateInArray} from "./error-handling.js";

describe("Error Handling", () => {
  describe("validateInArray", () => {
    it("should return true when value exists in array", () => {
      const array = ["foo", "bar", "baz"];
      expect(validateInArray("foo", array)).toBe(true);
      expect(validateInArray("bar", array)).toBe(true);
      expect(validateInArray("baz", array)).toBe(true);
    });

    it("should return false when value does not exist in array", () => {
      const array = ["foo", "bar", "baz"];
      expect(validateInArray("qux", array)).toBe(false);
      expect(validateInArray("", array)).toBe(false);
    });

    it("should work with numbers", () => {
      const array = [1, 2, 3];
      expect(validateInArray(2, array)).toBe(true);
      expect(validateInArray(5, array)).toBe(false);
    });

    it("should work with empty array", () => {
      const array: string[] = [];
      expect(validateInArray("foo", array)).toBe(false);
    });

    it("should be case sensitive for strings", () => {
      const array = ["Foo", "Bar"];
      expect(validateInArray("Foo", array)).toBe(true);
      expect(validateInArray("foo", array)).toBe(false);
    });
  });

  describe("validateBoolean", () => {
    it("should not throw for valid boolean true", () => {
      expect(() => {
        validateBoolean(true, "testVar");
      }).not.toThrow();
    });

    it("should not throw for valid boolean false", () => {
      expect(() => {
        validateBoolean(false, "testVar");
      }).not.toThrow();
    });

    it("should call process.exit for non-boolean values", () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const mockConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        validateBoolean("true", "testVar");
      }).toThrow();
      expect(() => {
        validateBoolean(1, "testVar");
      }).toThrow();
      expect(() => {
        validateBoolean(0, "testVar");
      }).toThrow();
      expect(() => {
        validateBoolean(null, "testVar");
      }).toThrow();
      expect(() => {
        validateBoolean(undefined, "testVar");
      }).toThrow();

      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });

    it("should include variable name in error message", () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const mockConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        validateBoolean("true", "myVariable");
      } catch {
        // Expected to throw from mocked process.exit
      }

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]"),
        expect.stringContaining("myVariable"),
      );

      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });
  });

  describe("die", () => {
    it("should call process.exit with exit code", () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const mockConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        die("Test error", 42);
      } catch {
        // Expected to throw
      }

      expect(mockExit).toHaveBeenCalledWith(42);

      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });

    it("should use exit code 1 by default", () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const mockConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        die("Test error");
      } catch {
        // Expected to throw
      }

      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
      mockConsoleError.mockRestore();
    });
  });
});
