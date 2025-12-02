import {parseStart, render, run} from "./rover.js";
import type {
  InstructionString,
  PositionDirectionString,
  RoverState,
} from "./types.js";

export class LegacyRover {
  private rs: RoverState;

  constructor(startPositionString: PositionDirectionString) {
    this.rs = parseStart(startPositionString);
  }

  public go(instructionString: InstructionString): void {
    this.rs = run(this.rs, instructionString);
  }

  public G(singleInstructionString: string): void {
    this.go(singleInstructionString);
  }

  public get XYD(): PositionDirectionString {
    return render(this.rs);
  }

  public pos(): PositionDirectionString {
    return this.XYD;
  }
}
