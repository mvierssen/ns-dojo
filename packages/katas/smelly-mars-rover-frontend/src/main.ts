import "./style.css";
import {
  DirectionEnum,
  parseStart,
} from "@ns-white-crane-white-belt/smelly-mars-rover";
import * as THREE from "three";
import {MESH_COMPONENT, type Mesh} from "./components/index.js";
import {getComponent} from "./ecs/component.js";
import type {EntityId} from "./ecs/entity.js";
import {createWorld} from "./ecs/index.js";
import {removeEntity} from "./ecs/world.js";
import {createCamera} from "./entities/create-camera.js";
import {createLight} from "./entities/create-light.js";
import {createRoverEntity} from "./entities/create-rover.js";
import {createCameraOrbitScript} from "./scripts/index.js";
import type {RoverAnimationScript} from "./scripts/rover-animation.js";
import {
  createRenderContext,
  handleResize,
  renderSystem,
  scriptSystem,
  transformSystem,
  type RenderContext,
} from "./systems/index.js";
import {UIManager} from "./ui-manager.js";

/**
 * Predefined rover colors matching the original cube colors
 */
const ROVER_COLORS = [
  0x44_88_ff, // Blue
  0xff_44_88, // Red/Pink
  0x44_ff_88, // Green
  0xff_aa_44, // Orange
  0xaa_44_ff, // Purple
];

/**
 * Main application entry point
 * Initializes the ECS world, Three.js rendering context, and game loop
 */
function main(): void {
  // Get the canvas element
  const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
  if (!canvas) throw new Error("Canvas element not found");

  // Create ECS world
  const world = createWorld();

  // Create Three.js render context
  const renderCtx: RenderContext = createRenderContext(canvas);

  // Create UI manager
  const uiManager = new UIManager();

  // Rover script registry (maps entityId to script)
  const roverScripts = new Map<EntityId, RoverAnimationScript>();

  // Create entities
  setupScene(world, renderCtx);

  // Wire up UI controls
  setupUIControls(world, renderCtx, uiManager, roverScripts);

  // Set up remove callback
  uiManager.setOnRemoveCallback((_roverId, entityId) => {
    handleRemoveRover(world, renderCtx, entityId, roverScripts);
  });

  // Add some initial rovers for demonstration
  addInitialRovers(world, renderCtx, uiManager, roverScripts);

  console.log(
    "Mars Rover Simulator initialized with",
    uiManager.getAllRoverIds().length,
    "rover(s)",
  );

  // Handle window resize
  window.addEventListener("resize", () => {
    handleResize(renderCtx);
  });

  // Start game loop
  let lastTime = performance.now();

  function gameLoop(currentTime: number): void {
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Run systems in order
    scriptSystem(world, deltaTime);
    transformSystem(world, deltaTime);
    renderSystem(world, deltaTime, renderCtx);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}

/**
 * Adds some initial rovers to the scene for demonstration
 */
function addInitialRovers(
  world: ReturnType<typeof createWorld>,
  renderCtx: RenderContext,
  uiManager: UIManager,
  roverScripts: Map<EntityId, RoverAnimationScript>,
): void {
  console.log("Adding initial rover to scene...");

  const initialRoverPositions = [{x: 1, y: 2, direction: DirectionEnum.North}];

  for (const [index, pos] of initialRoverPositions.entries()) {
    const positionDirectionString =
      `${String(pos.x)} ${String(pos.y)} ${pos.direction}` as const;
    const initialState = parseStart(positionDirectionString);
    const color = ROVER_COLORS[index % ROVER_COLORS.length];
    const id = `rover-initial-${String(index)}`;

    console.log(
      `Creating initial rover ${String(index)}: position (${String(pos.x)}, ${String(pos.y)}), direction ${pos.direction}, color 0x${color?.toString(16) ?? "unknown"}`,
    );

    const {entityId, script} = createRoverEntity(world, renderCtx, {
      id,
      initialState,
      color,
    });

    roverScripts.set(entityId, script);
    uiManager.addRover(id, entityId, color ?? 0x44_88_ff, initialState);
  }

  console.log("Initial rover added successfully");
}

/**
 * Sets up the scene with camera and lights
 */
function setupScene(
  world: ReturnType<typeof createWorld>,
  renderCtx: RenderContext,
): void {
  console.log("Setting up scene...");

  // Create camera with orbit script
  createCamera(world, {
    position: {x: 0, y: 5, z: 10},
    scriptFn: createCameraOrbitScript({
      radius: 15,
      speed: 0.3,
      height: 8,
    }),
  });

  // Create ambient light (brighter for better visibility)
  createLight(world, renderCtx, {
    type: "ambient",
    color: 0x80_80_80,
    intensity: 1,
  });

  // Create directional light
  createLight(world, renderCtx, {
    type: "directional",
    position: {x: 5, y: 10, z: 7.5},
    color: 0xff_ff_ff,
    intensity: 1,
  });

  // Add ground grid for reference
  const gridHelper = new THREE.GridHelper(20, 20, 0x44_44_44, 0x22_22_22);
  renderCtx.scene.add(gridHelper);

  console.log(
    "Scene setup complete. Grid added, camera orbiting at radius 15, height 8",
  );
}

/**
 * Sets up UI controls for rover management
 */
function setupUIControls(
  world: ReturnType<typeof createWorld>,
  renderCtx: RenderContext,
  uiManager: UIManager,
  roverScripts: Map<EntityId, RoverAnimationScript>,
): void {
  // Add Rover button
  const addRoverBtn = document.querySelector("#btn-add-rover");
  if (addRoverBtn) {
    addRoverBtn.addEventListener("click", () => {
      handleAddRover(world, renderCtx, uiManager, roverScripts);
    });
  }

  // Execute All button
  const executeAllBtn = document.querySelector("#btn-execute");
  if (executeAllBtn) {
    executeAllBtn.addEventListener("click", () => {
      handleExecuteAll(uiManager, roverScripts);
    });
  }

  // Reset All button
  const resetAllBtn = document.querySelector("#btn-reset");
  if (resetAllBtn) {
    resetAllBtn.addEventListener("click", () => {
      handleResetAll(world, renderCtx, uiManager, roverScripts);
    });
  }
}

/**
 * Handles adding a new rover
 */
function handleAddRover(
  world: ReturnType<typeof createWorld>,
  renderCtx: RenderContext,
  uiManager: UIManager,
  roverScripts: Map<EntityId, RoverAnimationScript>,
): void {
  // Generate random initial position and direction (only positive coordinates)
  const x = Math.floor(Math.random() * 10); // 0 to 9
  const y = Math.floor(Math.random() * 10); // 0 to 9
  const directions = [
    DirectionEnum.North,
    DirectionEnum.East,
    DirectionEnum.South,
    DirectionEnum.West,
  ];
  const direction =
    directions[Math.floor(Math.random() * directions.length)] ??
    DirectionEnum.North;

  // Create rover state
  const positionDirectionString =
    `${String(x)} ${String(y)} ${direction}` as const;
  const initialState = parseStart(positionDirectionString);

  // Choose color (cycle through predefined colors)
  const roverCount = uiManager.getAllRoverIds().length;
  const color = ROVER_COLORS[roverCount % ROVER_COLORS.length];

  // Generate unique ID
  const id = `rover-${String(Date.now())}-${Math.random().toString(36).slice(2, 9)}`;

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
 * Handles removing a single rover
 */
function handleRemoveRover(
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
function handleExecuteAll(
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
 * Handles resetting all rovers
 */
function handleResetAll(
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

// Start the application
main();
