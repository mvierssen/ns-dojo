import { RoverState } from "./RoverState.js";

export class Rover {
  constructor(p = "") {
    const s = p.split(" ");
    if (s.length >= 3) {
      this.rs.xx = Number.parseInt(s[0], 10);
      this.rs.yy = Number.parseInt(s[1], 10);
      this.rs.dd = s[2][0];
    }
  }

  public go(cms: string): void {
    for (const c of cms) {
      switch (c) {
        case "L": {
          switch (this.rs.dd) {
            case "E": {
              this.rs.dd = "N";

              break;
            }
            case "N": {
              this.rs.dd = "W";

              break;
            }
            case "W": {
              this.rs.dd = "S";

              break;
            }
            case "S": {
              this.rs.dd = "E";

              break;
            }
            // No default
          }

          break;
        }
        case "R": {
          switch (this.rs.dd) {
            case "E": {
              this.rs.dd = "S";

              break;
            }
            case "S": {
              this.rs.dd = "W";

              break;
            }
            case "W": {
              this.rs.dd = "N";

              break;
            }
            case "N": {
              this.rs.dd = "E";

              break;
            }
            // No default
          }

          break;
        }
        case "M": {
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

          break;
        }
        // No default
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
