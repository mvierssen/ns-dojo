import { RoverState } from "./RoverState.js";
import { CommandSchema, HeadingSchema } from "./schemas.js";

export class Rover {
  // Code Smell: Primitive Obsession "p"
  constructor(p = "") {
    // Code Smell: Magic String (" " delimiter)
    const s = p.split(" ");
    // Code Smell: Data Clumps (s[0], s[1], s[2])
    if (s.length >= 3) {
      if (s[0] === undefined || s[1] === undefined || s[2] === undefined) {
        throw new Error("Invalid position string");
      }
      if (typeof s[2][0] !== "string") {
        throw new TypeError("Invalid direction");
      }
      // Code Smell: Poor Naming "xx", Primitive Obsession, Feature Envy
      this.rs.xx = Number.parseInt(s[0], 10);
      // Code Smell: Poor Naming "yy", Primitive Obsession, Feature Envy
      this.rs.yy = Number.parseInt(s[1], 10);
      const safeHeading = HeadingSchema.parse(s[2][0]);
      this.rs.dd = safeHeading;
    }
  }

  // Code Smell: Long Function, Primitive Obsession "cms" (= public interface)
  public go(commands: string): void {
    const safeCommands = commands.split("").map((c) => CommandSchema.parse(c));
    for (const c of safeCommands) {
      const heading = this.rs.dd;
      switch (c) {
        // Code Smell: Feature Envy
        case CommandSchema.enum.L: {
          switch (heading) {
            case HeadingSchema.enum.E: {
              this.rs.dd = HeadingSchema.enum.N;
              break;
            }
            case HeadingSchema.enum.N: {
              this.rs.dd = HeadingSchema.enum.W;
              break;
            }
            case HeadingSchema.enum.W: {
              this.rs.dd = HeadingSchema.enum.S;
              break;
            }
            case HeadingSchema.enum.S: {
              this.rs.dd = HeadingSchema.enum.E;
              break;
            }
            // No default
          }

          break;
        }
        case CommandSchema.enum.R: {
          switch (heading) {
            case HeadingSchema.enum.E: {
              this.rs.dd = HeadingSchema.enum.S;
              break;
            }
            case HeadingSchema.enum.S: {
              this.rs.dd = HeadingSchema.enum.W;
              break;
            }
            case HeadingSchema.enum.W: {
              this.rs.dd = HeadingSchema.enum.N;
              break;
            }
            case HeadingSchema.enum.N: {
              this.rs.dd = HeadingSchema.enum.E;
              break;
            }
            // No default
          }

          break;
        }
        case CommandSchema.enum.M: {
          if (heading === HeadingSchema.enum.E) {
            this.rs.xx++;
          }
          if (heading === HeadingSchema.enum.S) {
            this.rs.yy--;
          }
          if (heading === HeadingSchema.enum.W) {
            this.rs.xx--;
          }
          if (heading === HeadingSchema.enum.N) {
            this.rs.yy++;
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
    return `${String(this.rs.xx)} ${String(this.rs.yy)} ${this.rs.dd}`;
  }

  // Code Smell: Primitive Obsession
  public pos(): string {
    return this.XYD;
  }

  private rs: RoverState = new RoverState();
}
