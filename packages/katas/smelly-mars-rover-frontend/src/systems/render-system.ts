import * as THREE from "three";
import {CAMERA_COMPONENT, type Camera} from "../components/index.js";
import {getComponent} from "../ecs/component.js";
import {queryEntities} from "../ecs/query.js";
import type {World} from "../ecs/world.js";

/**
 * Render context - Three.js scene, renderer, and active camera
 */
export interface RenderContext {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  activeCamera: THREE.Camera | null;
}

/**
 * Creates the render context with a Three.js scene and renderer
 */
export function createRenderContext(canvas: HTMLCanvasElement): RenderContext {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a_0a_0a);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  return {
    scene,
    renderer,
    activeCamera: null,
  };
}

/**
 * Handles window resize events
 */
export function handleResize(ctx: RenderContext): void {
  if (!ctx.activeCamera) return;

  ctx.renderer.setSize(window.innerWidth, window.innerHeight);

  // Update camera aspect ratio if it's a perspective camera
  if (ctx.activeCamera instanceof THREE.PerspectiveCamera) {
    ctx.activeCamera.aspect = window.innerWidth / window.innerHeight;
    ctx.activeCamera.updateProjectionMatrix();
  }
}

/**
 * Render System - renders the scene using the active camera
 * Should run last in the system pipeline
 */
export function renderSystem(
  world: World,
  _deltaTime: number,
  ctx: RenderContext,
): void {
  // Find the active camera
  const cameraEntities = queryEntities(world, [CAMERA_COMPONENT]);

  for (const entityId of cameraEntities) {
    const camera = getComponent(world, entityId, CAMERA_COMPONENT) as
      | Camera
      | undefined;

    if (camera?.isActive) {
      ctx.activeCamera = camera.camera;
      break;
    }
  }

  // Render the scene
  if (ctx.activeCamera) {
    ctx.renderer.render(ctx.scene, ctx.activeCamera);
  }
}
