export interface GameRules {
  boardDimensions: string;
  coinDropMechanics: string;
  turnOrder: string;
  winCondition: string;
  drawCondition: string;
  columnSelection: string;
}

export interface GameInstructions {
  welcome: string;
  rules: GameRules;
  startPrompt: string;
}

export interface InstructionsInterface {
  getInstructions(): GameInstructions;
}
