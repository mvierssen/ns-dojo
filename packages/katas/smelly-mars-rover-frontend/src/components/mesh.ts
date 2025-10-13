import type * as THREE from "three";
import {z} from "zod";
import type {ComponentType} from "../ecs/world.js";

/**
 * Mesh component - reference to a Three.js Object3D
 * Note: We use z.custom for Three.js types since they can't be validated at runtime
 */
export const MeshSchema = z.object({
  object3D: z.custom<THREE.Object3D>(
    (val) => val !== null && val !== undefined,
  ),
});

export type Mesh = z.infer<typeof MeshSchema>;

/**
 * Component type identifier
 */
export const MESH_COMPONENT = "mesh" as ComponentType;
