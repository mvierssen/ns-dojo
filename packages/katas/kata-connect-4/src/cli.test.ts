import {describe, expect, test} from "vitest";
import {resultIsSuccess, resultIsFailure} from "@ns-dojo/shared-core";
import {getCell} from "./board.js";
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
    const cell = getCell(board, {row: 1, column: 3});
    expect(cell).toBe(CellState.Player1);
  });

  test("handleInput alternates players between moves", () => {
    const game = new Game();
    game.start();
    const gameLoop = new GameLoop(game);

    gameLoop.handleInput("1");
    gameLoop.handleInput("2");
    gameLoop.handleInput("1");

    const board = game.getBoard();
    expect(getCell(board, {row: 1, column: 1})).toBe(CellState.Player1);
    expect(getCell(board, {row: 1, column: 2})).toBe(CellState.Player2);
    expect(getCell(board, {row: 2, column: 1})).toBe(CellState.Player1);
  });

  test("start with Player 1 as current player", () => {
    const game = new Game();
    const gameLoop = new GameLoop(game);

    const currentPlayer = gameLoop.getCurrentPlayer();
    expect(currentPlayer).toBe(CellState.Player1);
  });
});
