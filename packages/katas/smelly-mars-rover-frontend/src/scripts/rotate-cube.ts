import {TRANSFORM_COMPONENT, type Transform} from "../components/index.js";
import {getComponent} from "../ecs/component.js";
import type {EntityId} from "../ecs/entity.js";
import type {World} from "../ecs/world.js";

/**
 * Configuration for the rotate cube script
 */
export interface RotateCubeConfig {
  speedX?: number;
  speedY?: number;
  speedZ?: number;
}

/**
 * Creates a rotate cube script function with the specified rotation speeds
 */
export function createRotateCubeScript(
  config: RotateCubeConfig = {},
): (world: World, entityId: EntityId, deltaTime: number) => void {
  const speedX = config.speedX ?? 0.5;
  const speedY = config.speedY ?? 1;
  const speedZ = config.speedZ ?? 0;

  return (world: World, entityId: EntityId, deltaTime: number): void => {
    const transform = getComponent(world, entityId, TRANSFORM_COMPONENT) as
      | Transform
      | undefined;

    if (!transform) return;

    // Rotate the entity
    transform.rotation.x += speedX * deltaTime;
    transform.rotation.y += speedY * deltaTime;
    transform.rotation.z += speedZ * deltaTime;
  };
}
