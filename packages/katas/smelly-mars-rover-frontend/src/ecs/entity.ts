/**
 * Unique identifier for an entity in the ECS world.
 * Branded type for additional type safety.
 */
export type EntityId = string & { readonly __brand: "EntityId" };

/**
 * Creates a new unique entity ID using the browser's crypto API.
 */
export function createEntity(): EntityId {
  return crypto.randomUUID() as EntityId;
}
