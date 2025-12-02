export interface GameRules {
  boardDimensions: string;
  coinDropMechanics: string;
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
      coinDropMechanics: "Coins fall to the lowest available row in the selected column.",
    },
  };
}
