import {
  MOVE_VECTOR_MAP,
  TURN_LEFT_TRANSITION_MAP,
  TURN_RIGHT_TRANSITION_MAP,
} from "./constants.js";
import { LegacyRoverState } from "./LegacyRoverState.js";
import {
  CommandSchema,
  InstructionStringWithTransformSchema,
  PositionDirectionStringWithTransformSchema,
} from "./schemas.js";
import type {
  Command,
  InstructionString,
  PositionDirectionString,
} from "./types.js";

export class LegacyRover {
  constructor(startPositionString: PositionDirectionString) {
    const parsed =
      PositionDirectionStringWithTransformSchema.parse(startPositionString);
    // Code Smell: Feature Envy
    this.rs.x = parsed.x;
    // Code Smell: Feature Envy
    this.rs.y = parsed.y;
    this.rs.direction = parsed.direction;
  }

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

  public G(command: Command): void {
    const safeCommand = CommandSchema.parse(command);
    this.go(safeCommand);
  }

  // Code Smell: Poor Naming "XYD", Feature Envy
  public get XYD(): PositionDirectionString {
    return `${String(this.rs.x)} ${String(this.rs.y)} ${this.rs.direction}`;
  }

  public pos(): PositionDirectionString {
    return this.XYD;
  }

  private rs: LegacyRoverState = new LegacyRoverState();
}
