export const BOARD_ROWS = 6;
export const BOARD_COLUMNS = 7;

export enum CellState {
  Empty = "empty",
  Player1 = "player1",
  Player2 = "player2",
}

export const CELL_SYMBOLS: Record<CellState, string> = {
  [CellState.Empty]: ".",
  [CellState.Player1]: "\u001B[33mO\u001B[0m",
  [CellState.Player2]: "\u001B[31mO\u001B[0m",
};

export const COLUMN_LABELS = [1, 2, 3, 4, 5, 6, 7] as const;
export const ROW_LABELS = [1, 2, 3, 4, 5, 6] as const;
export const COLUMN_LABELS_STRING = "    1 2 3 4 5 6 7";
