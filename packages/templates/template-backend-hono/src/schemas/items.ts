import {z} from "@hono/zod-openapi";

/**
 * Item schemas for CRUD example with OpenAPI metadata
 */

/**
 * Base item schema (for database/internal use)
 */
export const ItemSchema = z
  .object({
    id: z.uuid().openapi({
      description: "Unique identifier for the item",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    name: z.string().min(1).max(100).openapi({
      description: "Display name of the item (1-100 characters)",
      example: "Sample Item",
    }),
    description: z.string().max(500).optional().openapi({
      description:
        "Optional detailed description of the item (max 500 characters)",
      example: "This is a sample item for demonstration purposes",
    }),
    quantity: z.number().int().min(0).openapi({
      description: "Available quantity (non-negative integer)",
      example: 42,
    }),
    price: z.number().min(0).openapi({
      description: "Price in currency units (non-negative)",
      example: 29.99,
    }),
    createdAt: z.iso.datetime().openapi({
      description: "ISO 8601 timestamp when item was created",
      example: "2025-11-08T12:00:00Z",
    }),
    updatedAt: z.iso.datetime().openapi({
      description: "ISO 8601 timestamp when item was last updated",
      example: "2025-11-08T12:30:00Z",
    }),
  })
  .openapi("Item");

export type Item = z.infer<typeof ItemSchema>;

/**
 * Schema for creating a new item (no id, timestamps)
 */
export const CreateItemSchema = ItemSchema.pick({
  name: true,
  description: true,
  quantity: true,
  price: true,
}).openapi("CreateItem", {
  description: "Payload for creating a new item",
});

export type CreateItem = z.infer<typeof CreateItemSchema>;

/**
 * Schema for updating an item (all fields optional except id in path)
 */
export const UpdateItemSchema = ItemSchema.pick({
  name: true,
  description: true,
  quantity: true,
  price: true,
})
  .partial()
  .openapi("UpdateItem", {
    description: "Payload for updating an existing item (all fields optional)",
  });

export type UpdateItem = z.infer<typeof UpdateItemSchema>;

/**
 * Path parameter schema for item ID
 */
export const ItemIdParamSchema = z
  .object({
    id: z.uuid().openapi({
      description: "Item identifier",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  })
  .openapi("ItemIdParam");

export type ItemIdParam = z.infer<typeof ItemIdParamSchema>;

/**
 * Query parameters for listing items (pagination)
 */
export const ListItemsQuerySchema = z
  .object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(1))
      .default(1)
      .openapi({
        description: "Page number for pagination (starts at 1)",
        example: "1",
      }),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .default(10)
      .openapi({
        description: "Number of items per page (1-100)",
        example: "10",
      }),
  })
  .openapi("ListItemsQuery");

export type ListItemsQuery = z.infer<typeof ListItemsQuerySchema>;

/**
 * Response schema for paginated list
 */
export const ListItemsResponseSchema = z
  .object({
    items: z.array(ItemSchema),
    pagination: z
      .object({
        page: z.number().int().openapi({
          description: "Current page number",
          example: 1,
        }),
        limit: z.number().int().openapi({
          description: "Items per page",
          example: 10,
        }),
        total: z.number().int().openapi({
          description: "Total number of items",
          example: 42,
        }),
        totalPages: z.number().int().openapi({
          description: "Total number of pages",
          example: 5,
        }),
      })
      .openapi("PaginationMeta"),
  })
  .openapi("ListItemsResponse", {
    description: "Paginated list of items with metadata",
  });

export type ListItemsResponse = z.infer<typeof ListItemsResponseSchema>;
