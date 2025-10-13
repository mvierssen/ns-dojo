import {parseStart} from "@ns-white-crane-white-belt/smelly-mars-rover";
import {MESH_COMPONENT, type Mesh} from "../components/index.js";
import {getComponent} from "../ecs/component.js";
import type {EntityId} from "../ecs/entity.js";
import {removeEntity} from "../ecs/index.js";
import type {createWorld} from "../ecs/index.js";
import {createRoverEntity} from "../entities/create-rover.js";
import type {RoverAnimationScript} from "../scripts/rover-animation.js";
import type {RenderContext} from "../systems/index.js";
import type {UIManager} from "../ui-manager.js";
import {ROVER_COLORS} from "../utils/index.js";
import {
  generateRandomDirection,
  generateRandomPosition,
  generateRoverId,
} from "./random-generation.js";

/**
 * Handles adding a new rover to the scene
 */
export function handleAddRover(
  world: ReturnType<typeof createWorld>,
  renderCtx: RenderContext,
  uiManager: UIManager,
  roverScripts: Map<EntityId, RoverAnimationScript>,
): void {
  // Generate random initial position and direction
  const {x, y} = generateRandomPosition(10, 10);
  const direction = generateRandomDirection();

  // Create rover state
  const positionDirectionString =
    `${String(x)} ${String(y)} ${direction}` as const;
  const initialState = parseStart(positionDirectionString);

  // Choose color (cycle through predefined colors)
  const roverCount = uiManager.getAllRoverIds().length;
  const color = ROVER_COLORS[roverCount % ROVER_COLORS.length];

  // Generate unique ID
  const id = generateRoverId();

  console.log(
    `Adding rover at position (${String(x)}, ${String(y)}) facing ${direction}`,
  );

  // Create rover entity
  const {entityId, script} = createRoverEntity(world, renderCtx, {
    id,
    initialState,
    color,
  });

  // Add to registry and UI
  roverScripts.set(entityId, script);
  uiManager.addRover(id, entityId, color ?? 0x44_88_ff, initialState);
}

/**
 * Handles removing a single rover from the scene
 */
export function handleRemoveRover(
  world: ReturnType<typeof createWorld>,
  renderCtx: RenderContext,
  entityId: EntityId,
  roverScripts: Map<EntityId, RoverAnimationScript>,
): void {
  // Remove mesh from scene
  const meshComponent = getComponent(world, entityId, MESH_COMPONENT) as
    | Mesh
    | undefined;
  if (meshComponent) {
    renderCtx.scene.remove(meshComponent.object3D);
  }

  // Remove from script registry
  roverScripts.delete(entityId);

  // Remove entity from world
  removeEntity(world, entityId);
}

/**
 * Handles executing all rover commands
 */
export function handleExecuteAll(
  uiManager: UIManager,
  roverScripts: Map<EntityId, RoverAnimationScript>,
): void {
  const commands = uiManager.getAllCommands();

  for (const [roverId, commandString] of commands.entries()) {
    const entityId = uiManager.getEntityId(roverId);
    if (!entityId) continue;

    const script = roverScripts.get(entityId);
    if (!script) continue;

    // Set commands using script method
    script.setCommands(commandString);
  }
}

/**
 * Handles resetting all rovers by removing them from the scene
 */
export function handleResetAll(
  world: ReturnType<typeof createWorld>,
  renderCtx: RenderContext,
  uiManager: UIManager,
  roverScripts: Map<EntityId, RoverAnimationScript>,
): void {
  // Remove all rover entities from world
  const roverIds = uiManager.getAllRoverIds();
  for (const roverId of roverIds) {
    const entityId = uiManager.getEntityId(roverId);
    if (entityId) {
      handleRemoveRover(world, renderCtx, entityId, roverScripts);
    }
  }

  // Clear UI
  uiManager.clearAll();
}
