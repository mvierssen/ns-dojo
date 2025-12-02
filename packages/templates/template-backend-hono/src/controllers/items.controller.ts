import {notFound} from "@ns-dojo/shared-hono/errors";
import type {Context} from "hono";
import type {CreateItem, ListItemsQuery, UpdateItem} from "../schemas/items.js";
import * as itemsService from "../services/items.service.js";

/**
 * Controllers are thin handlers that:
 * 1. Extract validated input from context
 * 2. Call service layer
 * 3. Return formatted response
 */

/**
 * List all items with pagination
 */
export function listItems(c: Context) {
  // Input is already validated by Zod middleware
  const {page, limit} = (c.req.valid as (target: string) => ListItemsQuery)(
    "query",
  );

  const {items, total} = itemsService.listItems(page, limit);

  const totalPages = Math.ceil(total / limit);

  return c.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}

/**
 * Get a single item by ID
 */
export function getItem(c: Context) {
  const {id} = (c.req.valid as (target: string) => {id: string})("param");

  const item = itemsService.getItem(id);

  if (!item) {
    return notFound(c, `Item with ID ${id} not found`);
  }

  return c.json(item);
}

/**
 * Create a new item
 */
export function createItem(c: Context) {
  const data = (c.req.valid as (target: string) => CreateItem)("json");

  const item = itemsService.createItem(data);

  return c.json(item, 201);
}

/**
 * Update an existing item
 */
export function updateItem(c: Context) {
  const {id} = (c.req.valid as (target: string) => {id: string})("param");
  const data = (c.req.valid as (target: string) => UpdateItem)("json");

  const item = itemsService.updateItem(id, data);

  if (!item) {
    return notFound(c, `Item with ID ${id} not found`);
  }

  return c.json(item);
}

/**
 * Delete an item
 */
export function deleteItem(c: Context) {
  const {id} = (c.req.valid as (target: string) => {id: string})("param");

  const deleted = itemsService.deleteItem(id);

  if (!deleted) {
    return notFound(c, `Item with ID ${id} not found`);
  }

  return c.json({success: true, message: "Item deleted"});
}
