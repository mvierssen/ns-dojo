import {DirectionEnum} from "@ns-white-crane-white-belt/smelly-mars-rover";

/**
 * Random position and direction generation for rovers
 */

const ALL_DIRECTIONS = [
  DirectionEnum.North,
  DirectionEnum.East,
  DirectionEnum.South,
  DirectionEnum.West,
] as const;

/**
 * Generates a random position within the specified bounds
 *
 * @param maxX - Maximum X coordinate (exclusive)
 * @param maxY - Maximum Y coordinate (exclusive)
 * @returns Random position {x, y}
 */
export function generateRandomPosition(
  maxX = 10,
  maxY = 10,
): {x: number; y: number} {
  return {
    x: Math.floor(Math.random() * maxX),
    y: Math.floor(Math.random() * maxY),
  };
}

/**
 * Generates a random direction
 *
 * @returns Random direction (North, East, South, or West)
 */
export function generateRandomDirection(): DirectionEnum {
  const index = Math.floor(Math.random() * ALL_DIRECTIONS.length);
  return ALL_DIRECTIONS[index] ?? DirectionEnum.North;
}

/**
 * Generates a unique rover ID
 *
 * @param prefix - ID prefix (default: "rover")
 * @returns Unique ID string
 */
export function generateRoverId(prefix = "rover"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${String(timestamp)}-${random}`;
}
