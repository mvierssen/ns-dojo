import {describe, expect, test} from "vitest";
import type {Result} from "@ns-dojo/shared-core";
import {
  resultIsSuccess,
  resultIsFailure,
  resultCreateSuccess,
  resultCreateFailure,
} from "@ns-dojo/shared-core";
import {createBoard, getCell} from "./board.js";
import {
  formatBoard,
  formatError,
  formatInstructions,
  formatPrompt,
  formatSuccess,
  formatWelcome,
  GameLoop,
  processColumnInput,
} from "./cli.js";
import {CellState} from "./constants.js";
import {Game} from "./game.js";
import type {GameInstructions} from "./instructions.js";
import type {Board, Column, IGame, Position} from "./types.js";

test("GameLoop accepts IGame interface", () => {
  const game: IGame = new Game();
  game.start();
  const gameLoop = new GameLoop(game);

  expect(gameLoop.getCurrentPlayer()).toBe(CellState.Player1);
});

describe("CliOutputShould", () => {
  test("format welcome message with game title", () => {
    const welcome = formatWelcome();
    expect(welcome).toContain("Connect 4");
  });

  test("format game instructions for console display", () => {
    const instructions: GameInstructions = {
      welcome: "Welcome to Connect 4!",
      rules: {
        boardDimensions: "The board has 6 rows and 7 columns.",
        coinDropMechanics: "Coins fall to the lowest available row in the selected column.",
        turnOrder: "Player 1 goes first, then players alternate turns.",
        winCondition: "Get 4 in a row to win - horizontal, vertical, or diagonal.",
        drawCondition: "The game is a draw if the board is full with no winner.",
        columnSelection: "Select a column from 1 to 7 to drop your coin.",
      },
      startPrompt: "Press Enter to start the game!",
    };

    const formatted = formatInstructions(instructions);
    expect(formatted).toContain("Welcome to Connect 4!");
    expect(formatted).toContain("6 rows and 7 columns");
    expect(formatted).toContain("column from 1 to 7");
  });

  test("format board string for console display", () => {
    const boardDisplay = "6 | ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪\n5 | ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪\n4 | ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪\n3 | ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪\n2 | ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪\n1 | ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪\n    1  2  3  4  5  6  7";

    const formatted = formatBoard(boardDisplay);
    expect(formatted).toContain("6 |");
    expect(formatted).toContain("1  2  3  4  5  6  7");
  });

  test("format player turn prompt", () => {
    const prompt = formatPrompt(1);
    expect(prompt).toContain("Player 1");
    expect(prompt).toMatch(/column|select|enter/i);
  });

  test("format player 2 turn prompt", () => {
    const prompt = formatPrompt(2);
    expect(prompt).toContain("Player 2");
  });

  test("format error message for display", () => {
    const errorMsg = "Column must be between 1 and 7";
    const formatted = formatError(errorMsg);
    expect(formatted).toContain(errorMsg);
    expect(formatted).toMatch(/error|invalid/i);
  });

  test("format success message for display", () => {
    const successMsg = "Coin placed in column 4";
    const formatted = formatSuccess(successMsg);
    expect(formatted).toContain(successMsg);
  });
});

describe("CliInputProcessingShould", () => {
  test("process valid column input and return success with column number", () => {
    const result = processColumnInput("4");
    expect(resultIsSuccess(result)).toBe(true);
    expect((result as {value: number}).value).toBe(4);
  });

  test("process invalid column input and return failure with error message", () => {
    const result = processColumnInput("abc");
    expect(resultIsFailure(result)).toBe(true);
    expect((result as {error: string}).error).toBeDefined();
    expect((result as {error: string}).error.length).toBeGreaterThan(0);
  });

  test("process out-of-range column and return failure", () => {
    const result = processColumnInput("9");
    expect(resultIsFailure(result)).toBe(true);
  });

  test("recognize 'q' as quit command", () => {
    const result = processColumnInput("q");
    expect(resultIsSuccess(result)).toBe(true);
    expect((result as {value: string}).value).toBe("quit");
  });

  test("recognize 'quit' as quit command", () => {
    const result = processColumnInput("quit");
    expect(resultIsSuccess(result)).toBe(true);
    expect((result as {value: string}).value).toBe("quit");
  });

  test("handle quit command case-insensitively", () => {
    const resultUpper = processColumnInput("QUIT");
    const resultMixed = processColumnInput("Quit");

    expect(resultIsSuccess(resultUpper)).toBe(true);
    expect(resultIsSuccess(resultMixed)).toBe(true);
  });
});

describe("GameLoopShould", () => {
  test("be created with a Game instance", () => {
    const game = new Game();
    const gameLoop = new GameLoop(game);
    expect(gameLoop).toBeDefined();
  });

  test("return welcome output with instructions", () => {
    const game = new Game();
    const gameLoop = new GameLoop(game);

    const output = gameLoop.getWelcomeOutput();
    expect(output).toContain("Connect 4");
    expect(output).toContain("6 rows and 7 columns");
  });

  test("return current board display", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    const output = gameLoop.getBoardOutput();
    expect(output).toContain("6 |");
    expect(output).toContain("1  2  3  4  5  6  7");
  });

  test("handle valid column input and return success response", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    const response = gameLoop.handleInput("4");
    expect(response.type).toBe("success");
    expect(response.message).toContain("4");
  });

  test("handle invalid column input and return error response", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    const response = gameLoop.handleInput("abc");
    expect(response.type).toBe("error");
    expect(response.message).toMatch(/not a number|invalid/i);
  });

  test("handle out-of-range column and return error response", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    const response = gameLoop.handleInput("9");
    expect(response.type).toBe("error");
    expect(response.message).toMatch(/between 1 and 7/i);
  });

  test("handle quit command and return quit signal", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    const response = gameLoop.handleInput("q");
    expect(response.type).toBe("quit");
    expect(response.message).toMatch(/goodbye|exit|quit/i);
  });

  test("handle 'quit' command and return quit signal", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    const response = gameLoop.handleInput("quit");
    expect(response.type).toBe("quit");
  });

  test("handleInput places coin on board for valid column", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    gameLoop.handleInput("3");

    const board = game.getBoard();
    const cellResult = getCell(board, {row: 1, column: 3});
    expect(resultIsSuccess(cellResult) && cellResult.value).toBe(CellState.Player1);
  });

  test("handleInput alternates players between moves", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    gameLoop.handleInput("1");
    gameLoop.handleInput("2");
    gameLoop.handleInput("1");

    const board = game.getBoard();
    const cell11 = getCell(board, {row: 1, column: 1});
    const cell12 = getCell(board, {row: 1, column: 2});
    const cell21 = getCell(board, {row: 2, column: 1});
    expect(resultIsSuccess(cell11) && cell11.value).toBe(CellState.Player1);
    expect(resultIsSuccess(cell12) && cell12.value).toBe(CellState.Player2);
    expect(resultIsSuccess(cell21) && cell21.value).toBe(CellState.Player1);
  });

  test("start with Player 1 as current player", () => {
    const game = new Game();
    const gameLoop = new GameLoop(game);

    const currentPlayer = gameLoop.getCurrentPlayer();
    expect(currentPlayer).toBe(CellState.Player1);
  });

  test("getPlayerPrompt returns Player 1's turn indicator with emoji", () => {
    const game = new Game();
    const gameLoop = new GameLoop(game);

    const prompt = gameLoop.getPlayerPrompt();
    expect(prompt).toBe("Player 1's turn (🟡)");
  });

  test("getPlayerPrompt returns Player 2's turn indicator with emoji", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    // Make one move to switch to Player 2
    gameLoop.handleInput("1");

    const prompt = gameLoop.getPlayerPrompt();
    expect(prompt).toBe("Player 2's turn (🔴)");
  });

  test("getPlayerPrompt updates after each successful move", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    expect(gameLoop.getPlayerPrompt()).toBe("Player 1's turn (🟡)");

    gameLoop.handleInput("1");
    expect(gameLoop.getPlayerPrompt()).toBe("Player 2's turn (🔴)");

    gameLoop.handleInput("2");
    expect(gameLoop.getPlayerPrompt()).toBe("Player 1's turn (🟡)");
  });

  test("show Player 2's turn after Player 1 makes valid move", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    expect(gameLoop.getPlayerPrompt()).toBe("Player 1's turn (🟡)");

    const response = gameLoop.handleInput("3");
    expect(response.type).toBe("success");
    expect(gameLoop.getPlayerPrompt()).toBe("Player 2's turn (🔴)");
  });

  test("show Player 1's turn again after Player 2 makes valid move", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    gameLoop.handleInput("1");
    expect(gameLoop.getPlayerPrompt()).toBe("Player 2's turn (🔴)");

    gameLoop.handleInput("2");
    expect(gameLoop.getPlayerPrompt()).toBe("Player 1's turn (🟡)");
  });

  test("keep current player unchanged when input is invalid", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    expect(gameLoop.getPlayerPrompt()).toBe("Player 1's turn (🟡)");

    const response = gameLoop.handleInput("abc");
    expect(response.type).toBe("error");
    expect(gameLoop.getPlayerPrompt()).toBe("Player 1's turn (🟡)");
  });

  test("keep current player unchanged when move fails due to full column", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    // Fill column 3 completely (6 rows) by making alternating moves
    for (let i = 0; i < 6; i++) {
      gameLoop.handleInput("3");
    }

    // After 6 moves, it's Player 1's turn again (started P1, alternated 6 times)
    expect(gameLoop.getPlayerPrompt()).toBe("Player 1's turn (🟡)");

    const response = gameLoop.handleInput("3");
    expect(response.type).toBe("error");
    expect(gameLoop.getPlayerPrompt()).toBe("Player 1's turn (🟡)");
  });

  test("announce winner when player wins", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    // Player 1 builds horizontal win
    gameLoop.handleInput("1"); // P1
    gameLoop.handleInput("1"); // P2
    gameLoop.handleInput("2"); // P1
    gameLoop.handleInput("2"); // P2
    gameLoop.handleInput("3"); // P1
    gameLoop.handleInput("3"); // P2
    const response = gameLoop.handleInput("4"); // P1 wins

    expect(response.type).toBe("win");
    expect(response.message).toContain("Player 1");
    expect(response.message).toContain("wins");
  });
});

class MockGame implements IGame {
  private board = createBoard();

  start(): void {
    // Mock implementation - no-op
  }

  getBoard(): Board {
    return this.board;
  }

  getInstructions(): GameInstructions {
    return {
      welcome: "Test",
      rules: {
        boardDimensions: "",
        coinDropMechanics: "",
        turnOrder: "",
        winCondition: "",
        drawCondition: "",
        columnSelection: "",
      },
      startPrompt: "",
    };
  }

  displayBoard(): string {
    return "mock board";
  }

  validateColumnInput(input: string): Result<Column> {
    const num = Number(input);
    if (num >= 1 && num <= 7) {
      return resultCreateSuccess(num as Column);
    }
    return resultCreateFailure("Invalid");
  }

  dropCoin(column: Column, _player: CellState): Result<{position: Position; winner: CellState | null}> {
    return resultCreateSuccess({position: {row: 1, column}, winner: null});
  }
}

describe("GameLoopWithMockShould", () => {
  test("work with mock game implementation", () => {
    const mockGame = new MockGame();
    mockGame.start();
    const gameLoop = new GameLoop(mockGame);

    const response = gameLoop.handleInput("3");
    expect(response.type).toBe("success");
  });

  test("display mock board output", () => {
    const mockGame = new MockGame();
    mockGame.start();
    const gameLoop = new GameLoop(mockGame);

    const output = gameLoop.getBoardOutput();
    expect(output).toBe("mock board");
  });
});
