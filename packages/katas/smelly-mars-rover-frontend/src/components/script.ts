import {z} from "zod";
import type {EntityId} from "../ecs/entity.js";
import type {ComponentType, World} from "../ecs/world.js";

/**
 * Script function type - executes logic on an entity each frame
 */
export type ScriptFn = (
  world: World,
  entityId: EntityId,
  deltaTime: number,
) => void;

/**
 * Script component - references a script function to execute
 */
export const ScriptSchema = z.object({
  scriptFn: z.custom<ScriptFn>((val) => typeof val === "function"),
  enabled: z.boolean().default(true),
});

export type Script = z.infer<typeof ScriptSchema>;

/**
 * Component type identifier
 */
export const SCRIPT_COMPONENT = "script" as ComponentType;

/**
 * Helper to create a script component
 */
export function createScript(scriptFn: ScriptFn, enabled = true): Script {
  return ScriptSchema.parse({scriptFn, enabled});
}
