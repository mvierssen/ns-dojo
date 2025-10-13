import {
  CAMERA_COMPONENT,
  TRANSFORM_COMPONENT,
  type Camera,
  type Transform,
} from "../components/index.js";
import {getComponent} from "../ecs/component.js";
import type {EntityId} from "../ecs/entity.js";
import type {World} from "../ecs/world.js";

/**
 * Configuration for the camera orbit script
 */
export interface CameraOrbitConfig {
  radius?: number;
  speed?: number;
  height?: number;
  targetX?: number;
  targetY?: number;
  targetZ?: number;
}

/**
 * Creates a camera orbit script that orbits around a target point
 */
export function createCameraOrbitScript(
  config: CameraOrbitConfig = {},
): (world: World, entityId: EntityId, deltaTime: number) => void {
  const radius = config.radius ?? 10;
  const speed = config.speed ?? 0.5;
  const height = config.height ?? 5;
  const targetX = config.targetX ?? 0;
  const targetY = config.targetY ?? 0;
  const targetZ = config.targetZ ?? 0;

  let angle = 0;

  return (world: World, entityId: EntityId, deltaTime: number): void => {
    const transform = getComponent(world, entityId, TRANSFORM_COMPONENT) as
      | Transform
      | undefined;
    const camera = getComponent(world, entityId, CAMERA_COMPONENT) as
      | Camera
      | undefined;

    if (!transform || !camera) return;

    // Update angle
    angle += speed * deltaTime;

    // Calculate orbit position
    const newX = targetX + Math.cos(angle) * radius;
    const newY = targetY + height;
    const newZ = targetZ + Math.sin(angle) * radius;

    // Update both Transform component and camera object directly
    transform.position.x = newX;
    transform.position.y = newY;
    transform.position.z = newZ;

    camera.camera.position.set(newX, newY, newZ);
    camera.camera.lookAt(targetX, targetY, targetZ);
  };
}
