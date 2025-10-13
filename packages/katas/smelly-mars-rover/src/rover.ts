import {
  CommandEnum,
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
  positionDirectionString: PositionDirectionString,
): RoverState => {
  const positionDirection = PositionDirectionStringWithTransformSchema.parse(
    positionDirectionString,
  );
  return {
    position: { x: positionDirection.x, y: positionDirection.y },
    direction: positionDirection.direction,
  };
};

const COMMAND_HANDLERS: Record<CommandEnum, (state: RoverState) => RoverState> =
  {
    [CommandEnum.Left]: (state) => ({
      ...state,
      direction: TURN_LEFT_TRANSITION_MAP[state.direction],
    }),
    [CommandEnum.Right]: (state) => ({
      ...state,
      direction: TURN_RIGHT_TRANSITION_MAP[state.direction],
    }),
    [CommandEnum.Move]: (state) => {
      const move = MOVE_VECTOR_MAP[state.direction];
      return {
        ...state,
        position: {
          x: state.position.x + move.x,
          y: state.position.y + move.y,
        },
      };
    },
  };

export const step = (state: RoverState, command: CommandEnum): RoverState =>
  COMMAND_HANDLERS[command](state);

export const run = (
  initialState: RoverState,
  instructionString: InstructionString,
): RoverState => {
  const instructions =
    InstructionStringWithTransformSchema.parse(instructionString);
  return [...instructions].reduce((s, c) => step(s, c), initialState);
};

export const render = (state: RoverState): string =>
  `${String(state.position.x)} ${String(state.position.y)} ${state.direction}`;
