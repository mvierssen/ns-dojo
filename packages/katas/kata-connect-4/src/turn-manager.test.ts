import {describe, expect, test} from "vitest";
import {createTurnManager, advanceTurn} from "./turn-manager.js";
import {CellState} from "./constants.js";

describe("TurnManagerShould", () => {
  test("start with Player1 as current player", () => {
    const turnManager = createTurnManager();
    expect(turnManager.currentPlayer).toBe(CellState.Player1);
  });

  test("switch to Player2 after Player1 move", () => {
    const turnManager = createTurnManager();
    const updated = advanceTurn(turnManager);

    expect(updated.currentPlayer).toBe(CellState.Player2);
  });

  test("switch to Player1 after Player2 move", () => {
    const turnManager = createTurnManager();
    const afterFirst = advanceTurn(turnManager);
    const afterSecond = advanceTurn(afterFirst);

    expect(afterSecond.currentPlayer).toBe(CellState.Player1);
  });
});
