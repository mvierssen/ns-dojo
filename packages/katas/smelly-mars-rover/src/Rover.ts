import { RoverState } from "./RoverState.js";
import {
  CommandSchema,
  HeadingSchema,
  StartPositionStringWithTransformSchema,
} from "./schemas.js";
import type { StartPositionString } from "./types.js";

export class Rover {
  constructor(startPositionString: StartPositionString) {
    const parsed =
      StartPositionStringWithTransformSchema.parse(startPositionString);
    // Code Smell: Poor Naming "xx", Feature Envy
    this.rs.x = parsed.x;
    // Code Smell: Poor Naming "yy", Feature Envy
    this.rs.y = parsed.y;
    this.rs.direction = parsed.direction;
  }

  // Code Smell: Long Function, Primitive Obsession "cms" (= public interface)
  public go(commands: string): void {
    const safeCommands = commands.split("").map((c) => CommandSchema.parse(c));
    for (const c of safeCommands) {
      const heading = this.rs.direction;
      switch (c) {
        // Code Smell: Feature Envy
        case CommandSchema.enum.L: {
          switch (heading) {
            case HeadingSchema.enum.E: {
              this.rs.direction = HeadingSchema.enum.N;
              break;
            }
            case HeadingSchema.enum.N: {
              this.rs.direction = HeadingSchema.enum.W;
              break;
            }
            case HeadingSchema.enum.W: {
              this.rs.direction = HeadingSchema.enum.S;
              break;
            }
            case HeadingSchema.enum.S: {
              this.rs.direction = HeadingSchema.enum.E;
              break;
            }
            // No default
          }

          break;
        }
        case CommandSchema.enum.R: {
          switch (heading) {
            case HeadingSchema.enum.E: {
              this.rs.direction = HeadingSchema.enum.S;
              break;
            }
            case HeadingSchema.enum.S: {
              this.rs.direction = HeadingSchema.enum.W;
              break;
            }
            case HeadingSchema.enum.W: {
              this.rs.direction = HeadingSchema.enum.N;
              break;
            }
            case HeadingSchema.enum.N: {
              this.rs.direction = HeadingSchema.enum.E;
              break;
            }
            // No default
          }

          break;
        }
        case CommandSchema.enum.M: {
          if (heading === HeadingSchema.enum.E) {
            this.rs.x++;
          }
          if (heading === HeadingSchema.enum.S) {
            this.rs.y--;
          }
          if (heading === HeadingSchema.enum.W) {
            this.rs.x--;
          }
          if (heading === HeadingSchema.enum.N) {
            this.rs.y++;
          }
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
