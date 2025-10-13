import "./style.css";
import {createWorld} from "./ecs/index.js";
import {createCamera} from "./entities/create-camera.js";
import {createCube} from "./entities/create-cube.js";
import {createLight} from "./entities/create-light.js";
import {
  createCameraOrbitScript,
  createRotateCubeScript,
} from "./scripts/index.js";
import {
  createRenderContext,
  handleResize,
  renderSystem,
  scriptSystem,
  transformSystem,
  type RenderContext,
} from "./systems/index.js";

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

  // Create entities
  setupScene(world, renderCtx);

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
 * Sets up the demo scene with camera, lights, and rotating cubes
 */
function setupScene(
  world: ReturnType<typeof createWorld>,
  renderCtx: RenderContext,
): void {
  // Create camera with orbit script
  createCamera(world, {
    position: {x: 0, y: 5, z: 10},
    scriptFn: createCameraOrbitScript({
      radius: 12,
      speed: 0.3,
      height: 6,
    }),
  });

  // Create ambient light
  createLight(world, renderCtx, {
    type: "ambient",
    color: 0x40_40_40,
    intensity: 0.5,
  });

  // Create directional light
  createLight(world, renderCtx, {
    type: "directional",
    position: {x: 5, y: 10, z: 7.5},
    color: 0xff_ff_ff,
    intensity: 1,
  });

  // Create rotating cubes in a pattern
  const cubePositions = [
    {x: 0, y: 0, z: 0, color: 0x44_88_ff},
    {x: -3, y: 0, z: -3, color: 0xff_44_88},
    {x: 3, y: 0, z: -3, color: 0x44_ff_88},
    {x: -3, y: 0, z: 3, color: 0xff_aa_44},
    {x: 3, y: 0, z: 3, color: 0xaa_44_ff},
  ];

  for (const pos of cubePositions) {
    createCube(world, renderCtx, {
      position: {x: pos.x, y: pos.y, z: pos.z},
      size: 1.5,
      color: pos.color,
      scriptFn: createRotateCubeScript({
        speedX: 0.5 + Math.random() * 0.5,
        speedY: 1 + Math.random() * 0.5,
        speedZ: Math.random() * 0.3,
      }),
    });
  }
}

// Start the application
main();
