import type {BoardInterface} from "./BoardInterface.js";
import type {GameInstructions} from "./InstructionsInterface.js";

export interface GameInterface {
  start(): void;
  getBoard(): BoardInterface;
  getInstructions(): GameInstructions;
}
