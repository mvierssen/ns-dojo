import type { EntityId } from "./entity.js";

/**
 * Component type identifier (e.g., "transform", "mesh", "script")
 * Branded type for additional type safety.
 */
export type ComponentType = string & { readonly __brand: "ComponentType" };

/**
 * The ECS World stores all entities and their components.
 * This is a plain data structure with no methods.
 */
export interface World {
  /** Set of all active entity IDs */
  entities: Set<EntityId>;
  /** Map of component type to entity-component data */
  components: Map<ComponentType, Map<EntityId, unknown>>;
}

/**
 * Creates a new empty ECS world.
 */
export function createWorld(): World {
  return {
    entities: new Set(),
    components: new Map(),
  };
}

/**
 * Adds an entity to the world.
 */
export function addEntity(world: World, entityId: EntityId): void {
  world.entities.add(entityId);
}

/**
 * Removes an entity and all its components from the world.
 */
export function removeEntity(world: World, entityId: EntityId): void {
  world.entities.delete(entityId);

  // Remove entity from all component maps
  for (const componentMap of world.components.values()) {
    componentMap.delete(entityId);
  }
}

/**
 * Checks if an entity exists in the world.
 */
export function hasEntity(world: World, entityId: EntityId): boolean {
  return world.entities.has(entityId);
}
