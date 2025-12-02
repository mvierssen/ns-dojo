import {createRoute, OpenAPIHono, z} from "@hono/zod-openapi";
import {defaultHook} from "../../openapi/config.js";
import {
  ProblemDetailsSchema,
  SuccessResponseSchema,
} from "../../schemas/common.js";
import {
  CreateItemSchema,
  ItemIdParamSchema,
  ItemSchema,
  ListItemsQuerySchema,
  ListItemsResponseSchema,
  UpdateItemSchema,
} from "../../schemas/items.js";
import * as itemsService from "../../services/items.service.js";

/**
 * Items CRUD router (v1)
 *
 * Demonstrates:
 * - RESTful resource routing
 * - Zod validation for all inputs
 * - Consistent error handling
 * - Standard HTTP methods and status codes
 *
 * Routes:
 * - GET    /items       - List all items (paginated)
 * - GET    /items/:id   - Get single item
 * - POST   /items       - Create new item
 * - PUT    /items/:id   - Update existing item
 * - DELETE /items/:id   - Delete item
 */

export const itemsRouter = new OpenAPIHono({defaultHook});

/**
 * List all items with pagination
 * Query params: ?page=1&limit=10
 */
const listItemsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Items"],
  summary: "List all items",
  description: "Retrieve a paginated list of items with optional filtering",
  operationId: "listItems",
  request: {
    query: ListItemsQuerySchema,
    headers: z.object({
      "x-api-version": z.string().optional().openapi({
        description: "API version",
        example: "v1",
      }),
    }),
  },
  responses: {
    200: {
      description: "Successful response with paginated items",
      content: {
        "application/json": {
          schema: ListItemsResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - invalid query parameters",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
  },
});

itemsRouter.openapi(listItemsRoute, (c) => {
  const {page, limit} = c.req.valid("query");
  const {items, total} = itemsService.listItems(page, limit);
  const totalPages = Math.ceil(total / limit);

  return c.json(
    {
      items,
      pagination: {page, limit, total, totalPages},
    },
    200,
  );
});

/**
 * Get a single item by ID
 */
const getItemRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Items"],
  summary: "Get item by ID",
  description: "Retrieve a single item by its unique identifier",
  operationId: "getItem",
  request: {
    params: ItemIdParamSchema,
    headers: z.object({
      "x-api-version": z.string().optional().openapi({
        description: "API version",
        example: "v1",
      }),
    }),
  },
  responses: {
    200: {
      description: "Item found",
      content: {
        "application/json": {
          schema: ItemSchema,
        },
      },
    },
    404: {
      description: "Item not found",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
  },
});

itemsRouter.openapi(getItemRoute, (c) => {
  const {id} = c.req.valid("param");
  const item = itemsService.getItem(id);

  if (!item) {
    return c.json(
      {
        type: "about:blank#not-found",
        title: "Not Found",
        status: 404,
        detail: `Item with ID ${id} not found`,
      },
      404,
    );
  }

  return c.json(item, 200);
});

/**
 * Create a new item
 */
const createItemRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Items"],
  summary: "Create a new item",
  description: "Create a new item with provided data",
  operationId: "createItem",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateItemSchema,
        },
      },
      required: true,
    },
    headers: z.object({
      "x-api-version": z.string().optional().openapi({
        description: "API version",
        example: "v1",
      }),
    }),
  },
  responses: {
    201: {
      description: "Item created successfully",
      content: {
        "application/json": {
          schema: ItemSchema,
        },
      },
    },
    400: {
      description: "Bad request - validation error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
  },
});

itemsRouter.openapi(createItemRoute, (c) => {
  const data = c.req.valid("json");
  const item = itemsService.createItem(data);

  return c.json(item, 201);
});

/**
 * Update an existing item
 */
const updateItemRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Items"],
  summary: "Update an item",
  description: "Update an existing item with partial data",
  operationId: "updateItem",
  request: {
    params: ItemIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateItemSchema,
        },
      },
      required: true,
    },
    headers: z.object({
      "x-api-version": z.string().optional().openapi({
        description: "API version",
        example: "v1",
      }),
    }),
  },
  responses: {
    200: {
      description: "Item updated successfully",
      content: {
        "application/json": {
          schema: ItemSchema,
        },
      },
    },
    400: {
      description: "Bad request - validation error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
    404: {
      description: "Item not found",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
  },
});

itemsRouter.openapi(updateItemRoute, (c) => {
  const {id} = c.req.valid("param");
  const data = c.req.valid("json");
  const item = itemsService.updateItem(id, data);

  if (!item) {
    return c.json(
      {
        type: "about:blank#not-found",
        title: "Not Found",
        status: 404,
        detail: `Item with ID ${id} not found`,
      },
      404,
    );
  }

  return c.json(item, 200);
});

/**
 * Delete an item
 */
const deleteItemRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Items"],
  summary: "Delete an item",
  description: "Permanently delete an item by ID",
  operationId: "deleteItem",
  request: {
    params: ItemIdParamSchema,
    headers: z.object({
      "x-api-version": z.string().optional().openapi({
        description: "API version",
        example: "v1",
      }),
    }),
  },
  responses: {
    200: {
      description: "Item deleted successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema,
        },
      },
    },
    404: {
      description: "Item not found",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ProblemDetailsSchema,
        },
      },
    },
  },
});

itemsRouter.openapi(deleteItemRoute, (c) => {
  const {id} = c.req.valid("param");
  const deleted = itemsService.deleteItem(id);

  if (!deleted) {
    return c.json(
      {
        type: "about:blank#not-found",
        title: "Not Found",
        status: 404,
        detail: `Item with ID ${id} not found`,
      },
      404,
    );
  }

  return c.json({success: true, message: "Item deleted"}, 200);
});
