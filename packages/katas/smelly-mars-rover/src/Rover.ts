import {
  MOVE_VECTOR_MAP,
  TURN_LEFT_TRANSITION_MAP,
  TURN_RIGHT_TRANSITION_MAP,
} from "./constants.js";
import {
  CommandSchema,
  InstructionStringWithTransformSchema,
  PositionDirectionStringWithTransformSchema,
} from "./schemas.js";
import type {
  Command,
  InstructionString,
  PositionDirectionString,
  RoverState,
} from "./types.js";

export const parseStart = (
  positionDirectionString: PositionDirectionString
): RoverState => {
  const parsed = PositionDirectionStringWithTransformSchema.parse(
    positionDirectionString
  );
  return {
    position: { x: parsed.x, y: parsed.y },
    direction: parsed.direction,
  };
};

export const step = (state: RoverState, command: Command): RoverState => {
  const dir = state.direction;
  if (command === CommandSchema.enum.L)
    return { ...state, direction: TURN_LEFT_TRANSITION_MAP[dir] };
  if (command === CommandSchema.enum.R)
    return { ...state, direction: TURN_RIGHT_TRANSITION_MAP[dir] };
  if (command === CommandSchema.enum.M) {
    const move = MOVE_VECTOR_MAP[dir];
    return {
      ...state,
      position: { x: state.position.x + move.x, y: state.position.y + move.y },
    };
  }
  return state;
};

export const run = (
  initialState: RoverState,
  commands: InstructionString
): RoverState => {
  const safe = InstructionStringWithTransformSchema.parse(commands);
  return [...safe].reduce((s, c) => step(s, c), initialState);
};

export const render = (state: RoverState): string =>
  `${String(state.position.x)} ${String(state.position.y)} ${state.direction}`;
