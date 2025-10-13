import type { EntityId } from "./entity.js";
import type { ComponentType, World } from "./world.js";

/**
 * Adds or updates a component for an entity.
 * The component data is not validated here - validation should happen at a higher level.
 */
export function addComponent(
  world: World,
  entityId: EntityId,
  componentType: ComponentType,
  componentData: unknown,
): void {
  let componentMap = world.components.get(componentType);

  if (!componentMap) {
    componentMap = new Map();
    world.components.set(componentType, componentMap);
  }

  componentMap.set(entityId, componentData);
}

/**
 * Gets a component for an entity, or undefined if it doesn't exist.
 * Caller must cast to the appropriate type.
 */
export function getComponent(
  world: World,
  entityId: EntityId,
  componentType: ComponentType,
): unknown {
  const componentMap = world.components.get(componentType);
  return componentMap?.get(entityId);
}

/**
 * Removes a component from an entity.
 */
export function removeComponent(
  world: World,
  entityId: EntityId,
  componentType: ComponentType,
): void {
  const componentMap = world.components.get(componentType);
  componentMap?.delete(entityId);
}

/**
 * Checks if an entity has a specific component.
 */
export function hasComponent(
  world: World,
  entityId: EntityId,
  componentType: ComponentType,
): boolean {
  const componentMap = world.components.get(componentType);
  return componentMap?.has(entityId) ?? false;
}
