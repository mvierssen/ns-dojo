import {
  resultCreateFailure,
  resultCreateSuccess,
  resultFlatMap,
  resultIsFailure,
  resultIsSuccess,
  type Result,
} from "@ns-dojo/shared-core/types";
import {
  Command,
  MOVE_VECTOR_MAP,
  TURN_LEFT_TRANSITION_MAP,
  TURN_RIGHT_TRANSITION_MAP,
} from "./constants.js";
import {
  InstructionStringWithTransformSchema,
  PositionDirectionStringWithTransformSchema,
  RoverStateSchema,
} from "./schemas.js";
import type {
  InstructionString,
  PositionDirectionString,
  RoverState,
} from "./types.js";

export const safeParseStart = (
  positionDirectionString: PositionDirectionString,
): Result<RoverState, Error> => {
  const positionDirection =
    PositionDirectionStringWithTransformSchema.safeParse(
      positionDirectionString,
    );
  if (!positionDirection.success) {
    return resultCreateFailure(new Error("Invalid position direction string"));
  }

  return resultCreateSuccess({
    position: { x: positionDirection.data.x, y: positionDirection.data.y },
    direction: positionDirection.data.direction,
  });
};

export const parseStart = (
  positionDirectionString: PositionDirectionString,
): RoverState => {
  const result = safeParseStart(positionDirectionString);
  if (resultIsFailure(result)) {
    throw result.error;
  }
  return result.value;
};

const COMMAND_HANDLERS: Record<Command, (state: RoverState) => RoverState> = {
  [Command.Left]: (state) => ({
    ...state,
    direction: TURN_LEFT_TRANSITION_MAP[state.direction],
  }),
  [Command.Right]: (state) => ({
    ...state,
    direction: TURN_RIGHT_TRANSITION_MAP[state.direction],
  }),
  [Command.Move]: (state) => {
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

export const safeStep = (
  state: RoverState,
  command: Command,
): Result<RoverState, Error> => {
  try {
    const next = COMMAND_HANDLERS[command](state);
    return resultCreateSuccess(next);
  } catch (error) {
    return resultCreateFailure(
      error instanceof Error ? error : new Error(String(error)),
    );
  }
};

export const step = (state: RoverState, command: Command): RoverState => {
  const result = safeStep(state, command);
  if (resultIsFailure(result)) {
    throw result.error;
  }
  return result.value;
};

export const safeRun = (
  initialState: RoverState,
  instructionString: InstructionString,
): Result<RoverState, Error> => {
  const instructions =
    InstructionStringWithTransformSchema.safeParse(instructionString);
  if (!instructions.success) {
    return resultCreateFailure(new Error("Invalid instruction string"));
  }

  const result = [...instructions.data].reduce<Result<RoverState, Error>>(
    (acc, c) =>
      resultIsSuccess(acc) ? resultFlatMap(acc, (s) => safeStep(s, c)) : acc,
    resultCreateSuccess(initialState),
  );

  return result;
};

export const run = (
  initialState: RoverState,
  instructionString: InstructionString,
): RoverState => {
  const result = safeRun(initialState, instructionString);
  if (resultIsFailure(result)) {
    throw result.error;
  }
  return result.value;
};

export const safeRender = (
  state: RoverState,
): Result<PositionDirectionString, Error> => {
  const validatedState = RoverStateSchema.safeParse(state);
  if (!validatedState.success) {
    return resultCreateFailure(new Error("Invalid rover state"));
  }

  const rendered = `${String(validatedState.data.position.x)} ${String(validatedState.data.position.y)} ${validatedState.data.direction}`;

  const validatedOutput =
    PositionDirectionStringWithTransformSchema.safeParse(rendered);
  if (!validatedOutput.success) {
    return resultCreateFailure(new Error("Invalid render output"));
  }

  return resultCreateSuccess(rendered);
};

export const render = (state: RoverState): string => {
  const result = safeRender(state);
  if (resultIsFailure(result)) {
    throw result.error;
  }
  return result.value;
};
