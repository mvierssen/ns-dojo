import { parseStart, run, render } from "./rover.js";
import type {
  Command,
  InstructionString,
  PositionDirectionString,
  RoverState,
} from "./types.js";

export class LegacyRover {
  private rs: RoverState;

  constructor(startPositionString: PositionDirectionString) {
    this.rs = parseStart(startPositionString);
  }

  public go(commands: InstructionString): void {
    this.rs = run(this.rs, commands);
  }

  public G(command: Command): void {
    this.go(command);
  }

  public get XYD(): PositionDirectionString {
    return render(this.rs);
  }

  public pos(): PositionDirectionString {
    return this.XYD;
  }
}
