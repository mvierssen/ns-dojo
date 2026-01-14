import {describe, expect, test} from "vitest";
import {createTurnManager} from "./turn-manager.js";
import {CellState} from "./constants.js";

describe("TurnManagerShould", () => {
  test("start with Player1 as current player", () => {
    const turnManager = createTurnManager();
    expect(turnManager.currentPlayer).toBe(CellState.Player1);
  });
});
