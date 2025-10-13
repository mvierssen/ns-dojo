import type { Vector2D } from "./types.js";

export enum DirectionEnum {
  North = "N",
  East = "E",
  South = "S",
  West = "W",
}

export enum CommandEnum {
  Left = "L",
  Right = "R",
  Move = "M",
}

export const INSTRUCTION_STRING_REGEX = /^[LRM]*$/;
export const POSITION_DIRECTION_STRING_REGEX = /^\d+ \d+ [NESW]$/;

export const TURN_LEFT_TRANSITION_MAP: Record<DirectionEnum, DirectionEnum> = {
  [DirectionEnum.North]: DirectionEnum.West,
  [DirectionEnum.West]: DirectionEnum.South,
  [DirectionEnum.South]: DirectionEnum.East,
  [DirectionEnum.East]: DirectionEnum.North,
};

export const TURN_RIGHT_TRANSITION_MAP: Record<DirectionEnum, DirectionEnum> = {
  [DirectionEnum.North]: DirectionEnum.East,
  [DirectionEnum.East]: DirectionEnum.South,
  [DirectionEnum.South]: DirectionEnum.West,
  [DirectionEnum.West]: DirectionEnum.North,
};

export const MOVE_VECTOR_MAP: Record<DirectionEnum, Vector2D> = {
  [DirectionEnum.North]: { x: 0, y: 1 },
  [DirectionEnum.East]: { x: 1, y: 0 },
  [DirectionEnum.South]: { x: 0, y: -1 },
  [DirectionEnum.West]: { x: -1, y: 0 },
};
