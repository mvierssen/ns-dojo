import {
  CAMERA_COMPONENT,
  MESH_COMPONENT,
  TRANSFORM_COMPONENT,
  type Camera,
  type Mesh,
  type Transform,
} from "../components/index.js";
import {getComponent} from "../ecs/component.js";
import {queryEntities} from "../ecs/query.js";
import type {World} from "../ecs/world.js";
import {syncTransformToObject3D} from "../utils/index.js";

/**
 * Transform System - syncs Transform components to Three.js Object3D transforms
 * Handles both Mesh and Camera entities
 * Runs every frame to update positions, rotations, and scales
 */
export function transformSystem(world: World, _deltaTime: number): void {
  // Sync Transform+Mesh entities
  const meshEntities = queryEntities(world, [
    TRANSFORM_COMPONENT,
    MESH_COMPONENT,
  ]);

  for (const entityId of meshEntities) {
    const transform = getComponent(world, entityId, TRANSFORM_COMPONENT) as
      | Transform
      | undefined;
    const mesh = getComponent(world, entityId, MESH_COMPONENT) as
      | Mesh
      | undefined;

    if (!transform || !mesh) continue;

    syncTransformToObject3D(transform, mesh.object3D);
  }

  // Sync Transform+Camera entities (skip rotation for cameras using lookAt)
  const cameraEntities = queryEntities(world, [
    TRANSFORM_COMPONENT,
    CAMERA_COMPONENT,
  ]);

  for (const entityId of cameraEntities) {
    const transform = getComponent(world, entityId, TRANSFORM_COMPONENT) as
      | Transform
      | undefined;
    const camera = getComponent(world, entityId, CAMERA_COMPONENT) as
      | Camera
      | undefined;

    if (!transform || !camera) continue;

    // Don't sync rotation for cameras - they use lookAt or manual rotation
    syncTransformToObject3D(transform, camera.camera, false);
  }
}
