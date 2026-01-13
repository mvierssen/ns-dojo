import {describe, expect, test} from "vitest";
import {formatBoard, formatError, formatInstructions, formatPrompt, formatWelcome} from "./cli.js";
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
    const boardDisplay = "6 | ◯ ◯ ◯ ◯ ◯ ◯ ◯\n5 | ◯ ◯ ◯ ◯ ◯ ◯ ◯\n4 | ◯ ◯ ◯ ◯ ◯ ◯ ◯\n3 | ◯ ◯ ◯ ◯ ◯ ◯ ◯\n2 | ◯ ◯ ◯ ◯ ◯ ◯ ◯\n1 | ◯ ◯ ◯ ◯ ◯ ◯ ◯\n    1 2 3 4 5 6 7";

    const formatted = formatBoard(boardDisplay);
    expect(formatted).toContain("6 |");
    expect(formatted).toContain("1 2 3 4 5 6 7");
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
});
