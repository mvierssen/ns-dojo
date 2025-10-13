import {DirectionEnum} from "@ns-white-crane-white-belt/smelly-mars-rover";

/**
 * Maps rover direction to 3D rotation (in radians, around Y axis)
 * North = 0, East = π/2, South = π, West = 3π/2
 */
export const DIRECTION_TO_ROTATION: Record<string, number> = {
  [DirectionEnum.North]: 0,
  [DirectionEnum.East]: Math.PI / 2,
  [DirectionEnum.South]: Math.PI,
  [DirectionEnum.West]: (3 * Math.PI) / 2,
};
