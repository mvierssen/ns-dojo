import {createBoard} from "../board-core.js";
import {setCell} from "../board-logic.js";
import type {CellState} from "../constants.js";
import type {Board, Position} from "../types.js";

export class BoardBuilder {
  private board: Board;

  private constructor(board: Board) {
    this.board = board;
  }

  static empty(): BoardBuilder {
    return new BoardBuilder(createBoard());
  }

  withCoin(position: Position, player: CellState): this {
    this.board = setCell(this.board, position, player);
    return this;
  }

  build(): Board {
    return this.board;
  }
}
