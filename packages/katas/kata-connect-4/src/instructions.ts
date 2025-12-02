export interface GameRules {
  boardDimensions: string;
}

export interface GameInstructions {
  welcome: string;
  rules: GameRules;
}

export function getGameInstructions(): GameInstructions {
  return {
    welcome: "Welcome to Connect 4!",
    rules: {
      boardDimensions: "The board has 6 rows and 7 columns.",
    },
  };
}
