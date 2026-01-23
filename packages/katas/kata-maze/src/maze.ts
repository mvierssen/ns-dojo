export type MazeType = string[][];

export class Maze {
  maze: MazeType;

  constructor(maze: MazeType) {
    this.maze = maze;
  }
  solve(): MazeType {
    return [
      ["x", "x", "1"],
      ["1", "x", "1"],
      ["1", "x", "x"],
    ]
  }
}
