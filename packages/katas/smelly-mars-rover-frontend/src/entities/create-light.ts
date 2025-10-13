import * as THREE from "three";
import { addComponent } from "../ecs/component.js";
import { createEntity, type EntityId } from "../ecs/entity.js";
import { addEntity, type World } from "../ecs/world.js";
import type { RenderContext } from "../systems/index.js";
import {
  LIGHT_COMPONENT,
  TRANSFORM_COMPONENT,
  createTransform,
  type LightType,
  type Transform,
} from "../components/index.js";

/**
 * Options for creating a light entity
 */
export interface CreateLightOptions {
  type: LightType;
  position?: { x: number; y: number; z: number };
  color?: number;
  intensity?: number;
}

/**
 * Creates a light entity based on the specified type
 */
export function createLight(
  world: World,
  renderCtx: RenderContext,
  options: CreateLightOptions,
): EntityId {
  const entityId = createEntity();
  addEntity(world, entityId);

  const color = options.color ?? 0xFF_FF_FF;
  const intensity = options.intensity ?? 1;

  // Create the appropriate Three.js light
  let light: THREE.Light;

  switch (options.type) {
    case "ambient": {
      light = new THREE.AmbientLight(color, intensity);
      break;
    }
    case "directional": {
      const dirLight = new THREE.DirectionalLight(color, intensity);
      dirLight.position.set(
        options.position?.x ?? 5,
        options.position?.y ?? 10,
        options.position?.z ?? 7.5,
      );
      light = dirLight;
      break;
    }
    case "point": {
      light = new THREE.PointLight(color, intensity);
      break;
    }
    case "spot": {
      light = new THREE.SpotLight(color, intensity);
      break;
    }
    case "hemisphere": {
      light = new THREE.HemisphereLight(color, 0x44_44_44, intensity);
      break;
    }
    default: {
      light = new THREE.AmbientLight(color, intensity);
    }
  }

  // Add light to scene
  renderCtx.scene.add(light);

  // Add Light component
  addComponent(world, entityId, LIGHT_COMPONENT, {
    light,
    type: options.type,
    color,
    intensity,
  });

  // Add Transform component
  const transform: Transform = createTransform({
    position: options.position ?? { x: 0, y: 0, z: 0 },
  });
  addComponent(world, entityId, TRANSFORM_COMPONENT, transform);

  return entityId;
}
