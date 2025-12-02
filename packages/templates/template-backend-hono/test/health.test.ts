import {describe, expect, it} from "vitest";
import {createApp} from "../src/app.js";

interface HealthResponse {
  status: string;
  timestamp: string;
}

describe("Health Endpoints", () => {
  const app = createApp();

  describe("GET /healthz", () => {
    it("should return 200 with status ok", async () => {
      const res = await app.request("/healthz");
      expect(res.status).toBe(200);

      const json = (await res.json()) as HealthResponse;
      expect(json).toMatchObject({
        status: "ok",
      });
      expect(json.timestamp).toBeDefined();
    });
  });

  describe("GET /readyz", () => {
    it("should return 200 with status ready", async () => {
      const res = await app.request("/readyz");
      expect(res.status).toBe(200);

      const json = (await res.json()) as HealthResponse;
      expect(json).toMatchObject({
        status: "ready",
      });
      expect(json.timestamp).toBeDefined();
    });
  });
});
