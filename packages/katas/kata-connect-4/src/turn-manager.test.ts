import {describe, expect, test} from "vitest";
import {CellState} from "./constants.js";
import {
  advanceTurn,
  createTurnManager,
  getPlayerSymbol,
} from "./turn-manager.js";

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

  test("return Player1 symbol for Player1 turn", () => {
    const turnManager = createTurnManager();
    const symbol = getPlayerSymbol(turnManager.currentPlayer);

    expect(symbol).toBe("\u001B[33mO\u001B[0m");
  });

  test("return Player2 symbol for Player2 turn", () => {
    const turnManager = createTurnManager();
    const updated = advanceTurn(turnManager);
    const symbol = getPlayerSymbol(updated.currentPlayer);

    expect(symbol).toBe("\u001B[31mO\u001B[0m");
  });
});
