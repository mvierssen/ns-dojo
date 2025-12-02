import type {CreateItem, Item, UpdateItem} from "../schemas/items.js";

/**
 * In-memory item store (for demonstration)
 *
 * In production, replace with:
 * - Database queries (pg, Prisma, Drizzle, etc.)
 * - External API calls
 * - Cache layer (Redis)
 */
const items = new Map<string, Item>([
  // Seed with example data
  [
    "550e8400-e29b-41d4-a716-446655440000",
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Example Item 1",
      description: "This is the first example item",
      quantity: 10,
      price: 29.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "550e8400-e29b-41d4-a716-446655440001",
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Example Item 2",
      description: "This is the second example item",
      quantity: 5,
      price: 49.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

/**
 * List all items with pagination
 */
export function listItems(
  page: number,
  limit: number,
): {
  items: Item[];
  total: number;
} {
  const allItems = Array.from(items.values());
  const offset = (page - 1) * limit;

  return {
    items: allItems.slice(offset, offset + limit),
    total: allItems.length,
  };
}

/**
 * Get a single item by ID
 */
export function getItem(id: string): Item | undefined {
  return items.get(id);
}

/**
 * Create a new item
 */
export function createItem(data: CreateItem): Item {
  const now = new Date().toISOString();
  const item: Item = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  items.set(item.id, item);
  return item;
}

/**
 * Update an existing item
 */
export function updateItem(id: string, data: UpdateItem): Item | undefined {
  const existing = items.get(id);
  if (!existing) {
    return undefined;
  }

  const updated: Item = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  items.set(id, updated);
  return updated;
}

/**
 * Delete an item
 */
export function deleteItem(id: string): boolean {
  return items.delete(id);
}
