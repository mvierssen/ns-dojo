import {
  MOVE_VECTOR_MAP,
  TURN_LEFT_TRANSITION_MAP,
  TURN_RIGHT_TRANSITION_MAP,
} from "./constants.js";
import { RoverState } from "./RoverState.js";
import {
  CommandSchema,
  InstructionStringWithTransformSchema,
  StartPositionStringWithTransformSchema,
} from "./schemas.js";
import type { InstructionString, StartPositionString } from "./types.js";

export class Rover {
  constructor(startPositionString: StartPositionString) {
    const parsed =
      StartPositionStringWithTransformSchema.parse(startPositionString);
    // Code Smell: Feature Envy
    this.rs.x = parsed.x;
    // Code Smell: Feature Envy
    this.rs.y = parsed.y;
    this.rs.direction = parsed.direction;
  }

  // Code Smell: Long Function
  public go(commands: InstructionString): void {
    const safeCommands = InstructionStringWithTransformSchema.parse(commands);
    for (const c of safeCommands) {
      const heading = this.rs.direction;
      switch (c) {
        // Code Smell: Feature Envy
        case CommandSchema.enum.L: {
          this.rs.direction = TURN_LEFT_TRANSITION_MAP[heading];
          break;
        }
        case CommandSchema.enum.R: {
          this.rs.direction = TURN_RIGHT_TRANSITION_MAP[heading];
          break;
        }
        case CommandSchema.enum.M: {
          const moveVector = MOVE_VECTOR_MAP[heading];
          this.rs.x += moveVector.x;
          this.rs.y += moveVector.y;
          break;
        }
        // No default
      }
    }
  }

  // Code Smell: Primitive Obsession
  public G(command: string): void {
    const safeCommand = CommandSchema.parse(command);
    this.go(safeCommand);
  }

  // Code Smell: Poor Naming "XYD", Primitive Obsession, Feature Envy
  public get XYD(): string {
    return `${String(this.rs.x)} ${String(this.rs.y)} ${this.rs.direction}`;
  }

  // Code Smell: Primitive Obsession
  public pos(): string {
    return this.XYD;
  }

  private rs: RoverState = new RoverState();
}
