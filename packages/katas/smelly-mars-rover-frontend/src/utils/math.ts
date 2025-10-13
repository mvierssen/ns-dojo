/**
 * Math utility functions for animations and interpolation
 */

/**
 * Linearly interpolates between two values
 *
 * @param start - Starting value
 * @param end - Ending value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Normalizes an angle to be within [0, 2π)
 *
 * @param angle - Angle in radians
 * @returns Normalized angle in range [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % (2 * Math.PI);
  if (normalized < 0) normalized += 2 * Math.PI;
  return normalized;
}

/**
 * Interpolates between two angles taking the shortest path
 *
 * @param from - Starting angle in radians
 * @param to - Target angle in radians
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated angle in radians
 */
export function lerpAngle(from: number, to: number, t: number): number {
  // Normalize both angles to [0, 2π)
  const fromNorm = normalizeAngle(from);
  const toNorm = normalizeAngle(to);

  // Calculate the difference
  let diff = toNorm - fromNorm;

  // Take the shorter path around the circle
  if (diff > Math.PI) {
    diff -= 2 * Math.PI;
  } else if (diff < -Math.PI) {
    diff += 2 * Math.PI;
  }

  // Interpolate using the shortest difference
  return fromNorm + diff * t;
}
