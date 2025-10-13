import type { EntityId } from "./entity.js";
import type { ComponentType, World } from "./world.js";

/**
 * Queries entities that have ALL of the specified component types.
 * Returns an array of entity IDs.
 */
export function queryEntities(
  world: World,
  componentTypes: ComponentType[],
): EntityId[] {
  if (componentTypes.length === 0) {
    return Array.from(world.entities);
  }

  // Start with entities that have the first component type
  const firstComponentType = componentTypes[0];
  if (!firstComponentType) {
    return [];
  }

  const firstComponentMap = world.components.get(firstComponentType);
  if (!firstComponentMap) {
    return [];
  }

  const candidates = Array.from(firstComponentMap.keys());

  // Filter candidates to only those that have all required components
  return candidates.filter((entityId) => {
    return componentTypes.every((componentType) => {
      const componentMap = world.components.get(componentType);
      return componentMap?.has(entityId) ?? false;
    });
  });
}
