import {createBoard} from "../board-core.js";
import type {Board} from "../types.js";

export class BoardBuilder {
  private board: Board;

  private constructor(board: Board) {
    this.board = board;
  }

  static empty(): BoardBuilder {
    return new BoardBuilder(createBoard());
  }

  build(): Board {
    return this.board;
  }
}
