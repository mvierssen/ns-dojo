import * as THREE from "three";
import {
  createTransform,
  MESH_COMPONENT,
  SCRIPT_COMPONENT,
  TRANSFORM_COMPONENT,
  type ScriptFn,
  type Transform,
} from "../components/index.js";
import {addComponent} from "../ecs/component.js";
import {createEntity, type EntityId} from "../ecs/entity.js";
import {addEntity, type World} from "../ecs/world.js";
import type {RenderContext} from "../systems/index.js";

/**
 * Options for creating a cube entity
 */
export interface CreateCubeOptions {
  position?: {x: number; y: number; z: number};
  rotation?: {x: number; y: number; z: number};
  scale?: {x: number; y: number; z: number};
  size?: number;
  color?: number;
  scriptFn?: ScriptFn;
}

/**
 * Creates a cube entity with a mesh and optional script
 */
export function createCube(
  world: World,
  renderCtx: RenderContext,
  options: CreateCubeOptions = {},
): EntityId {
  const entityId = createEntity();
  addEntity(world, entityId);

  // Create Three.js mesh
  const size = options.size ?? 1;
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({
    color: options.color ?? 0x44_88_ff,
  });
  const mesh = new THREE.Mesh(geometry, material);

  // Add mesh to scene
  renderCtx.scene.add(mesh);

  // Add Mesh component
  addComponent(world, entityId, MESH_COMPONENT, {
    object3D: mesh,
  });

  // Add Transform component
  const transform: Transform = createTransform({
    position: options.position ?? {x: 0, y: 0, z: 0},
    rotation: options.rotation ?? {x: 0, y: 0, z: 0},
    scale: options.scale ?? {x: 1, y: 1, z: 1},
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
