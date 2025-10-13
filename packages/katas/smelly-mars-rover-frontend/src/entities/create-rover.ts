import type {RoverState} from "@ns-white-crane-white-belt/smelly-mars-rover";
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
import {createRoverMesh} from "../factories/index.js";
import {
  createRoverAnimationScript,
  type RoverAnimationScript,
} from "../scripts/rover-animation.js";
import type {RenderContext} from "../systems/index.js";
import {DIRECTION_TO_ROTATION, roverPositionTo3D} from "../utils/index.js";

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

  // Create rover mesh using factory
  const roverMesh = createRoverMesh({color, size});

  // Add mesh to scene
  renderCtx.scene.add(roverMesh);

  // Add Mesh component (using the group as the mesh object)
  addComponent(world, entityId, MESH_COMPONENT, {
    object3D: roverMesh,
  });

  // Map 2D rover position (x, y) to 3D world position (x, 0, z)
  const position3D = roverPositionTo3D(
    initialState.position.x,
    initialState.position.y,
  );

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
