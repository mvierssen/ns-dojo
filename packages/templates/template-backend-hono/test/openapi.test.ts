import type {OpenAPIHono} from "@hono/zod-openapi";
import {beforeAll, describe, expect, it} from "vitest";
import {createApp} from "../src/app.js";

describe("OpenAPI Integration", () => {
  let app: OpenAPIHono;
  let openAPISpec: Record<string, unknown>;

  beforeAll(async () => {
    app = createApp();
    // Fetch OpenAPI spec for testing
    const res = await app.request("/openapi.json");
    openAPISpec = (await res.json()) as Record<string, unknown>;
  });

  describe("OpenAPI Specification", () => {
    it("should generate valid OpenAPI 3.1 spec", () => {
      expect(openAPISpec.openapi).toBe("3.1.0");
      expect(openAPISpec.info).toBeDefined();
      const info = openAPISpec.info as Record<string, unknown>;
      expect(info.title).toBeTruthy();
      expect(info.version).toBeTruthy();
    });

    it("should include API metadata", () => {
      const info = openAPISpec.info as Record<string, unknown>;
      expect(info.title).toBe("Hono Backend API");
      expect(info.version).toBe("1.0.0");
      expect(info.description).toBeTruthy();
    });

    it("should have server configurations", () => {
      expect(openAPISpec.servers).toBeDefined();
      const servers = openAPISpec.servers as unknown[];
      expect(servers.length).toBeGreaterThan(0);
      const firstServer = servers[0] as Record<string, unknown>;
      expect(firstServer.url).toBeTruthy();
    });
  });

  describe("Route Documentation", () => {
    it("should include all CRUD routes", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, unknown>
      >;

      // Items routes
      const itemsPath = paths["/api/v1/items"];
      expect(itemsPath).toBeDefined();
      expect(itemsPath?.get).toBeDefined();
      expect(itemsPath?.post).toBeDefined();
      const itemIdPath = paths["/api/v1/items/{id}"];
      expect(itemIdPath).toBeDefined();
      expect(itemIdPath?.get).toBeDefined();
      expect(itemIdPath?.put).toBeDefined();
      expect(itemIdPath?.delete).toBeDefined();
    });

    it("should include upload route", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, unknown>
      >;
      const uploadPath = paths["/api/v1/upload"];
      expect(uploadPath).toBeDefined();
      expect(uploadPath?.post).toBeDefined();
    });

    it("should include health check routes", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, unknown>
      >;
      expect(paths["/healthz"]).toBeDefined();
      expect(paths["/readyz"]).toBeDefined();
    });

    it("should include streaming routes", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, unknown>
      >;
      expect(paths["/api/v1/stream/ai"]).toBeDefined();
      expect(paths["/api/v1/stream/progress"]).toBeDefined();
    });
  });

  describe("Operation Metadata", () => {
    it("should have operation IDs for all routes", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, Record<string, unknown>>
      >;
      const itemsPath = paths["/api/v1/items"];
      const listItemsOp = itemsPath?.get;
      expect(listItemsOp).toBeDefined();
      if (listItemsOp) {
        expect(listItemsOp.operationId).toBe("listItems");
      }

      const createItemOp = itemsPath?.post;
      expect(createItemOp).toBeDefined();
      if (createItemOp) {
        expect(createItemOp.operationId).toBe("createItem");
      }
    });

    it("should have tags for all routes", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, Record<string, unknown>>
      >;
      const itemsPath = paths["/api/v1/items"];
      const listItemsOp = itemsPath?.get;
      expect(listItemsOp).toBeDefined();
      if (listItemsOp) {
        expect(listItemsOp.tags).toContain("Items");
      }

      const uploadPath = paths["/api/v1/upload"];
      const uploadOp = uploadPath?.post;
      expect(uploadOp).toBeDefined();
      if (uploadOp) {
        expect(uploadOp.tags).toContain("Upload");
      }
    });

    it("should have summaries and descriptions", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, Record<string, unknown>>
      >;
      const itemsPath = paths["/api/v1/items"];
      const listItemsOp = itemsPath?.get;
      expect(listItemsOp).toBeDefined();
      if (listItemsOp) {
        const op = listItemsOp;
        expect(op.summary).toBeTruthy();
        expect(op.description).toBeTruthy();
      }
    });
  });

  describe("Schema Definitions", () => {
    it("should include all schema definitions", () => {
      const components = openAPISpec.components as
        | Record<string, unknown>
        | undefined;
      expect(components).toBeDefined();

      if (components) {
        const schemas = components.schemas as Record<string, unknown>;

        // Item schemas
        expect(schemas.Item).toBeDefined();
        expect(schemas.CreateItem).toBeDefined();
        expect(schemas.UpdateItem).toBeDefined();
        expect(schemas.ListItemsResponse).toBeDefined();

        // Common schemas
        expect(schemas.ProblemDetails).toBeDefined();
        expect(schemas.SuccessResponse).toBeDefined();

        // Upload schemas
        expect(schemas.FileUpload).toBeDefined();
        expect(schemas.UploadResponse).toBeDefined();
      }
    });

    it("should have valid schema structures", () => {
      const components = openAPISpec.components as
        | Record<string, unknown>
        | undefined;
      expect(components).toBeDefined();

      if (components) {
        const schemas = components.schemas as Record<
          string,
          Record<string, unknown>
        >;
        const itemSchema = schemas.Item;

        expect(itemSchema).toBeDefined();
        if (itemSchema) {
          // Schemas should have either properties (object) or type definition
          expect(
            itemSchema.properties ?? itemSchema.type ?? itemSchema.$ref,
          ).toBeDefined();
        }
      }
    });

    it("should have well-structured field definitions", () => {
      const components = openAPISpec.components as
        | Record<string, unknown>
        | undefined;
      expect(components).toBeDefined();

      if (components) {
        const schemas = components.schemas as Record<
          string,
          Record<string, Record<string, unknown>>
        >;
        const itemSchema = schemas.Item;
        expect(itemSchema).toBeDefined();

        if (itemSchema) {
          const properties = itemSchema.properties as
            | Record<string, Record<string, unknown>>
            | undefined;

          // If schema has properties, verify they are well-formed
          if (properties) {
            const propertyNames = Object.keys(properties);
            expect(propertyNames.length).toBeGreaterThan(0);

            // Each property should have at least a type or $ref
            for (const propName of propertyNames) {
              const prop = properties[propName];
              expect(prop).toBeDefined();
              if (prop) {
                expect(
                  prop.type ?? prop.$ref ?? prop.anyOf ?? prop.oneOf,
                ).toBeDefined();
              }
            }
          }
        }
      }
    });
  });

  describe("Error Response Documentation", () => {
    it("should document error responses", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, Record<string, Record<string, unknown>>>
      >;
      const itemsPath = paths["/api/v1/items"];
      const listItemsOp = itemsPath?.get as Record<string, unknown> | undefined;
      expect(listItemsOp).toBeDefined();

      if (listItemsOp) {
        const responses = listItemsOp.responses as
          | Record<string, unknown>
          | undefined;
        expect(responses).toBeDefined();
        expect(responses?.["400"]).toBeDefined();
        expect(responses?.["500"]).toBeDefined();
      }
    });

    it("should reference ProblemDetails schema for errors", () => {
      const paths = openAPISpec.paths as Record<
        string,
        Record<string, Record<string, Record<string, unknown>>>
      >;
      const itemsPath = paths["/api/v1/items"];
      const listItemsOp = itemsPath?.get;
      expect(listItemsOp).toBeDefined();

      if (listItemsOp) {
        const responses = (listItemsOp as Record<string, unknown>).responses as
          | Record<string, unknown>
          | undefined;
        const badRequestResponse = responses?.["400"] as
          | Record<string, unknown>
          | undefined;
        expect(badRequestResponse).toBeDefined();

        if (badRequestResponse) {
          const content = badRequestResponse.content as
            | Record<string, unknown>
            | undefined;
          const jsonContent = content?.["application/json"] as
            | Record<string, unknown>
            | undefined;
          const schema = jsonContent?.schema as
            | Record<string, unknown>
            | undefined;

          if (schema) {
            expect(schema.$ref ?? schema.title).toBeTruthy();
          }
        }
      }
    });
  });

  describe("Swagger UI", () => {
    it("should have Swagger UI at /docs", async () => {
      const res = await app.request("/docs");
      expect(res.status).toBe(200);
      const contentType = res.headers.get("content-type");
      expect(contentType).toContain("text/html");
    });

    it("should have OpenAPI spec at /openapi.json", async () => {
      const res = await app.request("/openapi.json");
      expect(res.status).toBe(200);
      const contentType = res.headers.get("content-type");
      expect(contentType).toContain("application/json");
    });
  });
});
