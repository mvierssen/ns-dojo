import * as THREE from "three";
import {
  CAMERA_COMPONENT,
  createTransform,
  SCRIPT_COMPONENT,
  TRANSFORM_COMPONENT,
  type ScriptFn,
  type Transform,
} from "../components/index.js";
import {addComponent} from "../ecs/component.js";
import {createEntity, type EntityId} from "../ecs/entity.js";
import {addEntity, type World} from "../ecs/world.js";

/**
 * Options for creating a camera entity
 */
export interface CreateCameraOptions {
  position?: {x: number; y: number; z: number};
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  isActive?: boolean;
  scriptFn?: ScriptFn;
}

/**
 * Creates a camera entity with a perspective camera
 */
export function createCamera(
  world: World,
  options: CreateCameraOptions = {},
): EntityId {
  const entityId = createEntity();
  addEntity(world, entityId);

  // Create Three.js camera
  const fov = options.fov ?? 75;
  const aspect = options.aspect ?? window.innerWidth / window.innerHeight;
  const near = options.near ?? 0.1;
  const far = options.far ?? 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // Add Camera component
  addComponent(world, entityId, CAMERA_COMPONENT, {
    camera,
    fov,
    aspect,
    near,
    far,
    isActive: options.isActive ?? true,
  });

  // Add Transform component
  const transform: Transform = createTransform({
    position: options.position ?? {x: 0, y: 5, z: 10},
  });
  addComponent(world, entityId, TRANSFORM_COMPONENT, transform);

  // Add Script component if provided
  if (options.scriptFn) {
    addComponent(world, entityId, SCRIPT_COMPONENT, {
      scriptFn: options.scriptFn,
      enabled: true,
    });
  }

  return entityId;
}
