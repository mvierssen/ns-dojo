import {
  Command,
  MOVE_VECTOR_MAP,
  TURN_LEFT_TRANSITION_MAP,
  TURN_RIGHT_TRANSITION_MAP,
} from "./constants.js";
import {
  InstructionStringWithTransformSchema,
  PositionDirectionStringWithTransformSchema,
} from "./schemas.js";
import type {
  InstructionString,
  PositionDirectionString,
  RoverState,
} from "./types.js";

export const parseStart = (
  positionDirectionString: PositionDirectionString
): RoverState => {
  const positionDirection = PositionDirectionStringWithTransformSchema.parse(
    positionDirectionString
  );
  return {
    position: { x: positionDirection.x, y: positionDirection.y },
    direction: positionDirection.direction,
  };
};

export const step = (state: RoverState, command: Command): RoverState => {
  const direction = state.direction;
  if (command === Command.Left)
    return { ...state, direction: TURN_LEFT_TRANSITION_MAP[direction] };
  if (command === Command.Right)
    return { ...state, direction: TURN_RIGHT_TRANSITION_MAP[direction] };
  if (command === Command.Move) {
    const move = MOVE_VECTOR_MAP[direction];
    return {
      ...state,
      position: { x: state.position.x + move.x, y: state.position.y + move.y },
    };
  }
  return state;
};

export const run = (
  initialState: RoverState,
  instructionString: InstructionString
): RoverState => {
  const instructions =
    InstructionStringWithTransformSchema.parse(instructionString);
  return [...instructions].reduce((s, c) => step(s, c), initialState);
};

export const render = (state: RoverState): string =>
  `${String(state.position.x)} ${String(state.position.y)} ${state.direction}`;
