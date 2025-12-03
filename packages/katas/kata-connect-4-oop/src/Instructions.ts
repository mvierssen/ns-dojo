import type {
  GameInstructions,
  InstructionsInterface,
} from "./InstructionsInterface.js";

export class Instructions implements InstructionsInterface {
  getInstructions(): GameInstructions {
    return {
      welcome: "Welcome to Connect 4!",
      rules: {
        boardDimensions: "The board has 6 rows and 7 columns.",
        coinDropMechanics:
          "Coins fall to the lowest available row in the selected column.",
        turnOrder: "Player 1 goes first, then players alternate turns.",
        winCondition:
          "Get 4 in a row to win - horizontal, vertical, or diagonal.",
        drawCondition:
          "The game is a draw if the board is full with no winner.",
        columnSelection: "Select a column from 1 to 7 to drop your coin.",
      },
      startPrompt: "Press Enter to start the game!",
    };
  }
}
