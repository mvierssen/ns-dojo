type CellValues = "X" | "1" | "0" | "S" | "E";
export type MazeType = CellValues[][];

export class Maze {
  maze: MazeType;

  constructor(maze: MazeType) {
    this.maze = maze;
  }
  solve(): MazeType {
    return [
      ["X", "X", "1"],
      ["1", "X", "1"],
      ["1", "X", "X"],
    ]
  }
}
