import { RoverState } from "./RoverState.js";

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
      this.rs.dd = s[2][0];
    }
  }

  // Code Smell: Long Function, Primitive Obsession "cms", Poor Naming "cms"
  public go(cms: string): void {
    for (const c of cms) {
      switch (c) {
        // Code Smell: Magic Strings ("L", "R", "M", "E", "N", "W", "S"), Feature Envy
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

  // Code Smell: Primitive Obsession
  public G(z: string): void {
    if (typeof z[0] !== "string") {
      throw new TypeError("Invalid direction");
    }
    this.go(z[0]);
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
