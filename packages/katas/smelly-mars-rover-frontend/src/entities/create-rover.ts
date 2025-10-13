import {
  DirectionEnum,
  type RoverState,
} from "@ns-white-crane-white-belt/smelly-mars-rover";
import * as THREE from "three";
import {
  createScript,
  createTransform,
  MESH_COMPONENT,
  SCRIPT_COMPONENT,
  TRANSFORM_COMPONENT,
  type Transform,
} from "../components/index.js";
import {addComponent} from "../ecs/component.js";
import {createEntity, type EntityId} from "../ecs/entity.js";
import {addEntity, type World} from "../ecs/world.js";
import {
  createRoverAnimationScript,
  type RoverAnimationScript,
} from "../scripts/rover-animation.js";
import type {RenderContext} from "../systems/index.js";

/**
 * Options for creating a rover entity
 */
export interface CreateRoverOptions {
  id: string;
  initialState: RoverState;
  color?: number;
  size?: number;
}

/**
 * Result of creating a rover entity
 */
export interface CreateRoverResult {
  entityId: EntityId;
  script: RoverAnimationScript;
}

/**
 * Maps rover direction to 3D rotation (in radians, around Y axis)
 * North = 0, East = π/2, South = π, West = 3π/2
 */
const DIRECTION_TO_ROTATION: Record<string, number> = {
  [DirectionEnum.North]: 0,
  [DirectionEnum.East]: Math.PI / 2,
  [DirectionEnum.South]: Math.PI,
  [DirectionEnum.West]: (3 * Math.PI) / 2,
};

/**
 * Creates a rover entity with mesh, transform, and rover animation script
 * Maps 2D rover position (x, y) to 3D world position (x, 0, z)
 */
export function createRoverEntity(
  world: World,
  renderCtx: RenderContext,
  options: CreateRoverOptions,
): CreateRoverResult {
  const entityId = createEntity();
  addEntity(world, entityId);

  const {id, initialState, color = 0x44_88_ff, size = 1.5} = options;

  console.log(
    `Creating rover entity: id=${id}, pos=(${String(initialState.position.x)}, ${String(initialState.position.y)}), dir=${initialState.direction}, size=${String(size)}, color=0x${color.toString(16)}`,
  );

  // Create rover group (cube body + cone heading indicator)
  const roverGroup = new THREE.Group();

  // Create cube body
  const bodyGeometry = new THREE.BoxGeometry(size, size * 0.6, size);
  const bodyMaterial = new THREE.MeshStandardMaterial({color});
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.3; // Raise body so it sits on ground
  roverGroup.add(body);

  // Create cone heading indicator (pointing in the direction the rover faces)
  const coneHeight = size * 0.8;
  const coneRadius = size * 0.3;
  const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
  const coneMaterial = new THREE.MeshStandardMaterial({
    color: 0xff_ff_ff,
    emissive: color,
    emissiveIntensity: 0.3,
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);

  // Position cone on top of body, pointing forward (along -Z axis initially)
  cone.position.y = size * 0.6 + coneHeight / 2;
  cone.rotation.x = Math.PI / 2; // Rotate to point forward instead of up
  roverGroup.add(cone);

  // Add group to scene
  renderCtx.scene.add(roverGroup);

  // Add Mesh component (using the group as the mesh object)
  addComponent(world, entityId, MESH_COMPONENT, {
    object3D: roverGroup,
  });

  // Map 2D rover position (x, y) to 3D world position (x, 0, z)
  // y coordinate in rover state becomes z in 3D world
  const position3D = {
    x: initialState.position.x,
    y: 0, // Rovers sit on the ground plane
    z: initialState.position.y, // Rover's y becomes 3D z
  };

  console.log(
    `  → 3D position: (${String(position3D.x)}, ${String(position3D.y)}, ${String(position3D.z)})`,
  );

  // Map rover direction to 3D rotation
  const rotationY = DIRECTION_TO_ROTATION[initialState.direction] ?? 0;

  console.log(
    `  → Rotation: ${String(rotationY)} radians (${((rotationY * 180) / Math.PI).toFixed(0)} degrees)`,
  );

  // Add Transform component
  const transform: Transform = createTransform({
    position: position3D,
    rotation: {x: 0, y: rotationY, z: 0},
    scale: {x: 1, y: 1, z: 1},
  });
  addComponent(world, entityId, TRANSFORM_COMPONENT, transform);

  // Create and add Rover Animation Script
  const roverScript: RoverAnimationScript = createRoverAnimationScript({
    id,
    initialState,
    color,
  });
  const scriptComponent = createScript(roverScript.scriptFn);
  addComponent(world, entityId, SCRIPT_COMPONENT, scriptComponent);

  console.log(
    `  → Rover entity created successfully! EntityId: ${String(entityId)}`,
  );
  console.log(
    `  → Scene objects count: ${String(renderCtx.scene.children.length)}`,
  );

  return {entityId, script: roverScript};
}
