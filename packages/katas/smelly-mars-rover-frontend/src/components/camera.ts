import { z } from "zod";
import type * as THREE from "three";
import type { ComponentType } from "../ecs/world.js";

/**
 * Camera component - configuration for a perspective camera
 */
export const CameraSchema = z.object({
  camera: z.custom<THREE.Camera>((val) => val !== null && val !== undefined),
  fov: z.number().min(1).max(179).default(75),
  aspect: z.number().positive().default(1),
  near: z.number().positive().default(0.1),
  far: z.number().positive().default(1000),
  isActive: z.boolean().default(true),
});

export type Camera = z.infer<typeof CameraSchema>;

/**
 * Component type identifier
 */
export const CAMERA_COMPONENT = "camera" as ComponentType;
