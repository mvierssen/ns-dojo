import { Maze, type MazeType } from './maze.js';
import { describe, expect, test } from 'vitest';

// mazes are provided.  Write your own tests!

const SIMPLE_MAZE: MazeType = [
  ['S', '0', '1'],
  ['1', '0', '1'],
  ['1', '0', 'E'],
];

// const MODERATE_MAZE = [
//   ['S', '0', '0', '1', 'E'],
//   ['1', '0', '1', '1', '0'],
//   ['1', '0', '0', '1', '0'],
//   ['0', '0', '1', '0', '0'],
//   ['1', '0', '0', '0', '0'],
// ];

// const LARGE_MAZE = [
//   ['S','1','1','0','1','1','0','0','0','1','1','1','1'],
//   ['1','0','1','1','1','0','1','1','1','1','0','0','1'],
//   ['0','0','0','0','1','0','1','0','1','0','1','0','0'],
//   ['1','1','1','0','1','1','1','0','1','0','1','1','1'],
//   ['1','0','1','0','0','0','0','1','1','1','0','0','1'],
//   ['1','0','1','1','1','1','1','1','0','1','1','1','1'],
//   ['1','0','0','0','0','0','0','0','0','0','0','0','0'],
//   ['1','1','1','1','1','1','1','1','1','1','1','1','E'],
// ];

describe('Maze business class can', () => {
  test('return an instance of the Maze class', () => {
    const maze = new Maze(SIMPLE_MAZE);
    expect(maze.constructor.name).toEqual('Maze');
  });

  test('solve returns the solution for a simple maze', () => {
    const maze = new Maze(SIMPLE_MAZE);
    const solvedMaze: MazeType = [
      ["X", "X", "1"],
      ["1", "X", "1"],
      ["1", "X", "X"],
    ];

    expect(maze.solve()).toEqual(solvedMaze);
  });

  test('solve returns the solution for another simple maze', () => {
    // const anotherMaze: MazeType = [
    //   ['1', '0', '1'],
    //   ['1', '0', '1'],
    //   ['1', 'S', 'E'],
    // ];
    // const maze = new Maze(anotherMaze);

    // const solvedMaze: MazeType = [
    //   ['1', '0', '1'],
    //   ['1', '0', '1'],
    //   ['1', 'X', 'X'],
    // ];

    // expect(maze.solve()).toEqual(solvedMaze);
  });

  // xtest('skip a test marked with "xtest" instead of "test"', () => {
  //   expect(null).toEqual(null);
  // });
});
