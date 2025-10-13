import "./style.css";
import {
  DirectionEnum,
  parseStart,
} from "@ns-white-crane-white-belt/smelly-mars-rover";
import * as THREE from "three";
import type {EntityId} from "./ecs/entity.js";
import {createWorld} from "./ecs/index.js";
import {createCamera} from "./entities/create-camera.js";
import {createLight} from "./entities/create-light.js";
import {createRoverEntity} from "./entities/create-rover.js";
import {
  handleAddRover,
  handleExecuteAll,
  handleRemoveRover,
  handleResetAll,
} from "./handlers/index.js";
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
import {ROVER_COLORS} from "./utils/index.js";

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

// Start the application
main();
