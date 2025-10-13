import { getComponent } from "../ecs/component.js";
import { queryEntities } from "../ecs/query.js";
import type { World } from "../ecs/world.js";
import { SCRIPT_COMPONENT, type Script } from "../components/index.js";

/**
 * Script System - executes all enabled script functions
 * Runs every frame, calling each script's update function
 */
export function scriptSystem(world: World, deltaTime: number): void {
  // Query all entities with Script components
  const entities = queryEntities(world, [SCRIPT_COMPONENT]);

  for (const entityId of entities) {
    const script = getComponent(world, entityId, SCRIPT_COMPONENT) as Script | undefined;

    if (!script?.enabled) continue;

    // Execute the script function
    script.scriptFn(world, entityId, deltaTime);
  }
}
