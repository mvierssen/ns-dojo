/**
 * Utilities for mapping between 2D rover coordinates and 3D world coordinates
 */

/**
 * Maps 2D rover position (x, y) to 3D world position (x, 0, z)
 *
 * @param roverX - Rover X coordinate
 * @param roverY - Rover Y coordinate
 * @returns 3D world position with y=0 (ground plane)
 */
export function roverPositionTo3D(
  roverX: number,
  roverY: number,
): {x: number; y: number; z: number} {
  return {
    x: roverX,
    y: 0, // Rovers sit on the ground plane
    z: roverY, // Rover's y becomes 3D z
  };
}
