import {describe, expect, it} from "vitest";
import {createApp} from "../src/app.js";

interface Item {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface ListItemsResponse {
  items: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ErrorResponse {
  title: string;
  status: number;
  issues?: {path: string[]; message: string}[];
}

describe("Items API", () => {
  const app = createApp();

  describe("GET /api/v1/items", () => {
    it("should list items with pagination", async () => {
      const res = await app.request("/api/v1/items?page=1&limit=10");
      expect(res.status).toBe(200);

      const json = (await res.json()) as ListItemsResponse;
      expect(json.items).toBeInstanceOf(Array);
      expect(json.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
      expect(json.pagination.total).toBeGreaterThanOrEqual(0);
    });

    it("should default to page 1 and limit 10", async () => {
      const res = await app.request("/api/v1/items");
      expect(res.status).toBe(200);

      const json = (await res.json()) as ListItemsResponse;
      expect(json.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
    });

    it("should validate pagination parameters", async () => {
      const res = await app.request("/api/v1/items?page=invalid&limit=999");
      expect(res.status).toBe(400);

      const json = (await res.json()) as ErrorResponse;
      expect(json.title).toBe("Bad Request");
      expect(json.issues).toBeDefined();
    });
  });

  describe("POST /api/v1/items", () => {
    it("should create a new item", async () => {
      const newItem = {
        name: "Test Item",
        description: "A test item",
        quantity: 5,
        price: 19.99,
      };

      const res = await app.request("/api/v1/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      expect(res.status).toBe(201);

      const json = (await res.json()) as Item;
      expect(json.id).toBeDefined();
      expect(json.name).toBe(newItem.name);
      expect(json.quantity).toBe(newItem.quantity);
      expect(json.price).toBe(newItem.price);
      expect(json.createdAt).toBeDefined();
      expect(json.updatedAt).toBeDefined();
    });

    it("should validate item data", async () => {
      const invalidItem = {
        name: "", // Empty name
        quantity: -1, // Negative quantity
      };

      const res = await app.request("/api/v1/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidItem),
      });

      expect(res.status).toBe(400);

      const json = (await res.json()) as ErrorResponse;
      expect(json.title).toBe("Bad Request");
      expect(json.issues).toBeDefined();
      expect(json.issues && json.issues.length > 0).toBe(true);
    });
  });

  describe("GET /api/v1/items/:id", () => {
    it("should get an item by ID", async () => {
      // First, create an item
      const newItem = {
        name: "Get Test Item",
        quantity: 3,
        price: 29.99,
      };

      const createRes = await app.request("/api/v1/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const created = (await createRes.json()) as Item;

      // Then get it by ID
      const getRes = await app.request(`/api/v1/items/${created.id}`);
      expect(getRes.status).toBe(200);

      const json = (await getRes.json()) as Item;
      expect(json.id).toBe(created.id);
      expect(json.name).toBe(newItem.name);
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await app.request(
        "/api/v1/items/00000000-0000-0000-0000-000000000000",
      );
      expect(res.status).toBe(404);

      const json = (await res.json()) as ErrorResponse;
      expect(json.title).toBe("Not Found");
    });

    it("should validate ID format", async () => {
      const res = await app.request("/api/v1/items/invalid-id");
      expect(res.status).toBe(400);

      const json = (await res.json()) as ErrorResponse;
      expect(json.title).toBe("Bad Request");
    });
  });

  describe("PUT /api/v1/items/:id", () => {
    it("should update an item", async () => {
      // First, create an item
      const newItem = {
        name: "Update Test Item",
        quantity: 10,
        price: 39.99,
      };

      const createRes = await app.request("/api/v1/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const created = (await createRes.json()) as Item;

      // Then update it
      const update = {
        name: "Updated Item",
        quantity: 15,
      };

      const updateRes = await app.request(`/api/v1/items/${created.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });

      expect(updateRes.status).toBe(200);

      const json = (await updateRes.json()) as Item;
      expect(json.id).toBe(created.id);
      expect(json.name).toBe(update.name);
      expect(json.quantity).toBe(update.quantity);
      expect(json.price).toBe(created.price); // Unchanged
      expect(json.updatedAt).toBeDefined();
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await app.request(
        "/api/v1/items/00000000-0000-0000-0000-000000000000",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({name: "Test"}),
        },
      );

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/items/:id", () => {
    it("should delete an item", async () => {
      // First, create an item
      const newItem = {
        name: "Delete Test Item",
        quantity: 1,
        price: 9.99,
      };

      const createRes = await app.request("/api/v1/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const created = (await createRes.json()) as Item;

      // Then delete it
      const deleteRes = await app.request(`/api/v1/items/${created.id}`, {
        method: "DELETE",
      });

      expect(deleteRes.status).toBe(200);

      const json = (await deleteRes.json()) as {
        success: boolean;
        message: string;
      };
      expect(json.success).toBe(true);

      // Verify it's deleted
      const getRes = await app.request(`/api/v1/items/${created.id}`);
      expect(getRes.status).toBe(404);
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await app.request(
        "/api/v1/items/00000000-0000-0000-0000-000000000000",
        {
          method: "DELETE",
        },
      );

      expect(res.status).toBe(404);
    });
  });
});
