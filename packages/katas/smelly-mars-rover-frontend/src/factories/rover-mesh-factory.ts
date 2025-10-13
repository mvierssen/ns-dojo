import * as THREE from "three";

/**
 * Factory for creating rover 3D meshes
 */

/**
 * Options for creating a rover mesh
 */
export interface RoverMeshOptions {
  color?: number;
  size?: number;
}

/**
 * Creates a rover 3D mesh (cube body + cone heading indicator)
 *
 * @param options - Mesh creation options
 * @returns Three.js Group containing the rover mesh
 */
export function createRoverMesh(options: RoverMeshOptions = {}): THREE.Group {
  const {color = 0x44_88_ff, size = 1.5} = options;

  // Create rover group (cube body + cone heading indicator)
  const roverGroup = new THREE.Group();

  // Create cube body
  const bodyGeometry = new THREE.BoxGeometry(size, size * 0.6, size);
  const bodyMaterial = new THREE.MeshStandardMaterial({color});
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = size * 0.3; // Raise body so it sits on ground
  roverGroup.add(body);

  // Create cone heading indicator (pointing in the direction the rover faces)
  const coneHeight = size * 0.8;
  const coneRadius = size * 0.3;
  const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
  const coneMaterial = new THREE.MeshStandardMaterial({
    color: 0xff_ff_ff,
    emissive: color,
    emissiveIntensity: 0.3,
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);

  // Position cone on top of body, pointing forward (along -Z axis initially)
  cone.position.y = size * 0.6 + coneHeight / 2;
  cone.rotation.x = Math.PI / 2; // Rotate to point forward instead of up
  roverGroup.add(cone);

  return roverGroup;
}
