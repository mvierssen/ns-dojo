import { z } from "zod";
import type * as THREE from "three";
import type { ComponentType } from "../ecs/world.js";

/**
 * Light types supported
 */
export const LightTypeSchema = z.enum([
  "ambient",
  "directional",
  "point",
  "spot",
  "hemisphere",
]);

export type LightType = z.infer<typeof LightTypeSchema>;

/**
 * Light component - configuration for a Three.js light
 */
export const LightSchema = z.object({
  light: z.custom<THREE.Light>((val) => val !== null && val !== undefined),
  type: LightTypeSchema,
  color: z.number().int().default(0xFF_FF_FF), // Hex color
  intensity: z.number().min(0).default(1),
});

export type Light = z.infer<typeof LightSchema>;

/**
 * Component type identifier
 */
export const LIGHT_COMPONENT = "light" as ComponentType;
