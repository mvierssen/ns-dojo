import { z } from "zod";
import type { ComponentType } from "../ecs/world.js";

/**
 * 3D vector schema
 */
export const Vec3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type Vec3 = z.infer<typeof Vec3Schema>;

/**
 * Transform component - position, rotation (Euler angles in radians), and scale
 */
export const TransformSchema = z.object({
  position: Vec3Schema,
  rotation: Vec3Schema,
  scale: Vec3Schema,
});

export type Transform = z.infer<typeof TransformSchema>;

/**
 * Component type identifier
 */
export const TRANSFORM_COMPONENT = "transform" as ComponentType;

/**
 * Helper to create a default transform
 */
export function createTransform(
  partial?: Partial<Transform>,
): Transform {
  return TransformSchema.parse({
    position: partial?.position ?? { x: 0, y: 0, z: 0 },
    rotation: partial?.rotation ?? { x: 0, y: 0, z: 0 },
    scale: partial?.scale ?? { x: 1, y: 1, z: 1 },
  });
}
