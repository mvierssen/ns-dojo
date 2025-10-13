import type { Direction, Vector2D } from "./types.js";

export const INSTRUCTION_STRING_REGEX = /^[LRM]*$/;
export const POSITION_DIRECTION_STRING_REGEX = /^\d+ \d+ [NESW]$/;

export const TURN_LEFT_TRANSITION_MAP: Record<Direction, Direction> = {
  N: "W",
  W: "S",
  S: "E",
  E: "N",
};

export const TURN_RIGHT_TRANSITION_MAP: Record<Direction, Direction> = {
  N: "E",
  E: "S",
  S: "W",
  W: "N",
};

export const MOVE_VECTOR_MAP: Record<Direction, Vector2D> = {
  N: { x: 0, y: 1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: -1 },
  W: { x: -1, y: 0 },
};
