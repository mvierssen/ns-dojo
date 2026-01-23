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

  test('solve returns the solution', () => {
    const maze = new Maze(SIMPLE_MAZE);
    expect(maze.solve()).toEqual(
      [
      ["x", "x", "1"],
      ["1", "x", "1"],
      ["1", "x", "x"],
    ]);
  });

  // xtest('skip a test marked with "xtest" instead of "test"', () => {
  //   expect(null).toEqual(null);
  // });
});
