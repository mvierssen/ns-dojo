import { RoverState } from "./RoverState.js";

export class Rover {
  constructor(p: string = "") {
    const s = p.split(" ");
    if (s.length >= 3) {
      this.rs.xx = parseInt(s[0], 10);
      this.rs.yy = parseInt(s[1], 10);
      this.rs.dd = s[2][0];
    }
  }

  public go(cms: string): void {
    for (let i = 0; i < cms.length; i++) {
      const c = cms[i];
      if (c === "L") {
        if (this.rs.dd === "E") {
          this.rs.dd = "N";
        } else if (this.rs.dd === "N") {
          this.rs.dd = "W";
        } else if (this.rs.dd === "W") {
          this.rs.dd = "S";
        } else if (this.rs.dd === "S") {
          this.rs.dd = "E";
        }
      } else if (c === "R") {
        if (this.rs.dd === "E") {
          this.rs.dd = "S";
        } else if (this.rs.dd === "S") {
          this.rs.dd = "W";
        } else if (this.rs.dd === "W") {
          this.rs.dd = "N";
        } else if (this.rs.dd === "N") {
          this.rs.dd = "E";
        }
      } else if (c === "M") {
        if (this.rs.dd === "E") {
          this.rs.xx++;
        }
        if (this.rs.dd === "S") {
          this.rs.yy--;
        }
        if (this.rs.dd === "W") {
          this.rs.xx--;
        }
        if (this.rs.dd === "N") {
          this.rs.yy++;
        }
      }
    }
  }

  public G(z: string): void {
    this.go(z[0]);
  }

  public get XYD(): string {
    return `${this.rs.xx} ${this.rs.yy} ${this.rs.dd}`;
  }

  public pos(): string {
    return this.XYD;
  }

  private rs: RoverState = new RoverState();
}
