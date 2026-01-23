type CellValues = "X" | "1" | "0" | "S" | "E";
export type MazeType = CellValues[][];

export class Maze {
  maze: MazeType;

  constructor(maze: MazeType) {
    this.maze = maze;
  }
  solve(): MazeType {
    //BFS: Breath First Search
//     const start ...
//     const target ... 
    
//     var queue = [start];

//     while queue.isNotEmpty {
//       const current = queue.dequeue();
// // 
//       if current == target {
//         // done
//       }

//       const neighbours = current.neighbours
      

//     }

    return [
      ["X", "X", "1"],
      ["1", "X", "1"],
      ["1", "X", "X"],
    ]
  }
}
