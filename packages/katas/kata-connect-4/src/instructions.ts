export interface GameInstructions {
  welcome: string;
}

export function getGameInstructions(): GameInstructions {
  return {
    welcome: "Welcome to Connect 4!",
  };
}
