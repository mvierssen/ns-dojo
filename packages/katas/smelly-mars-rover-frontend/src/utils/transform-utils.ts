import type * as THREE from "three";
import type {Transform} from "../components/index.js";

/**
 * Syncs a Transform component to a Three.js Object3D
 *
 * @param transform - ECS Transform component
 * @param object3D - Three.js Object3D to sync
 * @param syncRotation - Whether to sync rotation (default: true)
 */
export function syncTransformToObject3D(
  transform: Transform,
  object3D: THREE.Object3D,
  syncRotation = true,
): void {
  // Sync position
  object3D.position.set(
    transform.position.x,
    transform.position.y,
    transform.position.z,
  );

  // Sync rotation (Euler angles) - optional for cameras using lookAt
  if (syncRotation) {
    object3D.rotation.set(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z,
    );
  }

  // Sync scale
  object3D.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
}
