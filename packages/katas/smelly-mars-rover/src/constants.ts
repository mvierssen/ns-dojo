import type { Vector2D } from "./types.js";

export enum Direction {
  North = "N",
  East = "E",
  South = "S",
  West = "W",
}

export enum Command {
  Left = "L",
  Right = "R",
  Move = "M",
}

export const INSTRUCTION_STRING_REGEX = /^[LRM]*$/;
export const POSITION_DIRECTION_STRING_REGEX = /^\d+ \d+ [NESW]$/;

export const TURN_LEFT_TRANSITION_MAP: Record<Direction, Direction> = {
  [Direction.North]: Direction.West,
  [Direction.West]: Direction.South,
  [Direction.South]: Direction.East,
  [Direction.East]: Direction.North,
};

export const TURN_RIGHT_TRANSITION_MAP: Record<Direction, Direction> = {
  [Direction.North]: Direction.East,
  [Direction.East]: Direction.South,
  [Direction.South]: Direction.West,
  [Direction.West]: Direction.North,
};

export const MOVE_VECTOR_MAP: Record<Direction, Vector2D> = {
  [Direction.North]: { x: 0, y: 1 },
  [Direction.East]: { x: 1, y: 0 },
  [Direction.South]: { x: 0, y: -1 },
  [Direction.West]: { x: -1, y: 0 },
};
