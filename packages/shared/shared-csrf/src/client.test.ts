import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {
  addCsrfToFormData,
  addCsrfToHeaders,
  createCsrfHiddenInput,
  getCsrfTokenFromCookie,
} from "./client.js";

const mockDocument = {
  cookie: "",
  createElement: vi.fn(),
};

describe("CSRF Client Utilities", () => {
  describe("getCsrfTokenFromCookie", () => {
    beforeEach(() => {
      vi.stubGlobal("document", mockDocument);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("should return null when document is undefined", () => {
      vi.unstubAllGlobals();
      const result = getCsrfTokenFromCookie();
      expect(result).toBeNull();
    });

    it("should extract CSRF token from cookie", () => {
      mockDocument.cookie = "__csrf=abc123.def456; other=value";
      const result = getCsrfTokenFromCookie();
      expect(result).toBe("abc123.def456");
    });

    it("should handle URL encoded cookie values", () => {
      mockDocument.cookie = "__csrf=abc%2E123; other=value";
      const result = getCsrfTokenFromCookie();
      expect(result).toBe("abc.123");
    });

    it("should return null when CSRF cookie not found", () => {
      mockDocument.cookie = "other=value; session=xyz";
      const result = getCsrfTokenFromCookie();
      expect(result).toBeNull();
    });

    it("should use custom cookie name", () => {
      mockDocument.cookie = "custom_csrf=token123; other=value";
      const result = getCsrfTokenFromCookie("custom_csrf");
      expect(result).toBe("token123");
    });

    it("should handle empty cookie string", () => {
      mockDocument.cookie = "";
      const result = getCsrfTokenFromCookie();
      expect(result).toBeNull();
    });

    it("should handle malformed cookies gracefully", () => {
      mockDocument.cookie = "__csrf; malformed=; =value";
      const result = getCsrfTokenFromCookie();
      expect(result).toBeNull();
    });
  });

  describe("addCsrfToFormData", () => {
    it("should add CSRF token to FormData with default field name", () => {
      const formData = new FormData();
      const token = "abc123.def456";

      addCsrfToFormData(formData, token);

      expect(formData.get("_csrf")).toBe(token);
    });

    it("should add CSRF token to FormData with custom field name", () => {
      const formData = new FormData();
      const token = "abc123.def456";

      addCsrfToFormData(formData, token, "custom_csrf");

      expect(formData.get("custom_csrf")).toBe(token);
    });

    it("should overwrite existing CSRF token", () => {
      const formData = new FormData();
      formData.set("_csrf", "old-token");

      addCsrfToFormData(formData, "new-token");

      expect(formData.get("_csrf")).toBe("new-token");
    });
  });

  describe("addCsrfToHeaders", () => {
    it("should add CSRF token to headers with default header name", () => {
      const headers = {"Content-Type": "application/json"};
      const token = "abc123.def456";

      const result = addCsrfToHeaders(headers, token);

      expect(result).toEqual({
        "Content-Type": "application/json",
        "x-csrf-token": token,
      });
    });

    it("should add CSRF token to headers with custom header name", () => {
      const headers = {};
      const token = "abc123.def456";

      const result = addCsrfToHeaders(headers, token, "X-Custom-CSRF");

      expect(result).toEqual({
        "X-Custom-CSRF": token,
      });
    });

    it("should handle empty headers object", () => {
      const headers = {};
      const token = "abc123.def456";

      const result = addCsrfToHeaders(headers, token);

      expect(result).toEqual({
        "x-csrf-token": token,
      });
    });

    it("should overwrite existing CSRF header", () => {
      const headers = {"x-csrf-token": "old-token"};
      const token = "new-token";

      const result = addCsrfToHeaders(headers, token);

      expect(result).toEqual({
        "x-csrf-token": token,
      });
    });
  });

  describe("createCsrfHiddenInput", () => {
    beforeEach(() => {
      const mockInput = {
        type: "",
        name: "",
        value: "",
      };
      mockDocument.createElement.mockReturnValue(mockInput);
      vi.stubGlobal("document", mockDocument);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    });

    it("should create hidden input with default field name", () => {
      const token = "abc123.def456";
      const input = createCsrfHiddenInput(token);

      expect(mockDocument.createElement).toHaveBeenCalledWith("input");
      expect(input.type).toBe("hidden");
      expect(input.name).toBe("_csrf");
      expect(input.value).toBe(token);
    });

    it("should create hidden input with custom field name", () => {
      const token = "abc123.def456";
      const input = createCsrfHiddenInput(token, "custom_csrf");

      expect(input.type).toBe("hidden");
      expect(input.name).toBe("custom_csrf");
      expect(input.value).toBe(token);
    });

    it("should throw error when document is undefined", () => {
      vi.unstubAllGlobals();

      expect(() => createCsrfHiddenInput("token")).toThrow(
        "createCsrfHiddenInput can only be used in browser environment",
      );
    });
  });

  describe("Integration tests", () => {
    it("should work with all client utilities together", () => {
      vi.stubGlobal("document", mockDocument);
      mockDocument.cookie = "__csrf=test-token.random";

      const mockInput = {
        type: "",
        name: "",
        value: "",
      };
      mockDocument.createElement.mockReturnValue(mockInput);

      const token = getCsrfTokenFromCookie();
      expect(token).toBe("test-token.random");

      if (!token) throw new Error("Token should not be null");

      const headers = addCsrfToHeaders({}, token);
      expect(headers).toHaveProperty("x-csrf-token", token);

      const formData = new FormData();
      addCsrfToFormData(formData, token);
      expect(formData.get("_csrf")).toBe(token);

      const input = createCsrfHiddenInput(token);
      expect(input.type).toBe("hidden");
      expect(input.name).toBe("_csrf");
      expect(input.value).toBe(token);

      vi.unstubAllGlobals();
    });
  });
});
