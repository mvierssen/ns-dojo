import {describe, expect, test} from "vitest";
import {Command} from "./constants.js";
import {parseStart, render, run, safeRender, safeStep, step} from "./rover.js";
import type {RoverState} from "./types.js";

describe("MarsRoverShould", () => {
  test.each([
    ["1 2 N", "", "1 2 N"],
    ["1 2 N", "L", "1 2 W"],
    ["1 2 W", "L", "1 2 S"],
    ["1 2 S", "L", "1 2 E"],
    ["1 2 E", "L", "1 2 N"],
    ["1 2 N", "R", "1 2 E"],
    ["1 2 E", "R", "1 2 S"],
    ["1 2 S", "R", "1 2 W"],
    ["1 2 W", "R", "1 2 N"],
    ["1 2 N", "M", "1 3 N"],
    ["1 2 E", "M", "2 2 E"],
    ["1 2 S", "M", "1 1 S"],
    ["1 2 W", "M", "0 2 W"],
    ["1 2 N", "LMLMLMLMM", "1 3 N"],
    ["3 3 E", "MMRMMRMRRM", "5 1 E"],
  ])(
    "start at '%s', with instructions '%s' => '%s'",
    (startingPosition, instructions, expectedOutput) => {
      const finalPosition = run(parseStart(startingPosition), instructions);
      expect(render(finalPosition)).toBe(expectedOutput);
    },
  );

  describe("fail cases", () => {
    describe("parseStart", () => {
      test("should throw error for invalid position string", () => {
        expect(() => parseStart("invalid")).toThrow();
      });
    });

    describe("run", () => {
      test("should throw error for invalid instructions", () => {
        const state = parseStart("1 2 N");
        expect(() => run(state, "X")).toThrow();
      });
    });

    describe("render", () => {
      test("should throw error for invalid rover state", () => {
        const invalidState = {position: {x: 1.5, y: 2}, direction: "N"};
        expect(() => render(invalidState as unknown as RoverState)).toThrow();
      });

      test("should throw error for negative coordinates", () => {
        const state = parseStart("0 0 W");
        const negativeState = step(state, Command.Move);
        expect(() => render(negativeState)).toThrow("Invalid render output");
      });
    });

    describe("safeRender", () => {
      test("should return error for negative coordinates", () => {
        const state = parseStart("0 0 W");
        const negativeState = step(state, Command.Move);
        const result = safeRender(negativeState);

        expect(result).toHaveProperty("success", false);
      });
    });

    describe("safeStep", () => {
      test("should handle errors for corrupted state", () => {
        const corruptedState = {
          position: {x: 1, y: 2},
          direction: "INVALID",
        } as unknown as RoverState;

        const result = safeStep(corruptedState, Command.Move);

        expect(result).toHaveProperty("success", false);
      });
    });

    describe("step", () => {
      test("should throw error for corrupted state", () => {
        const corruptedState = {
          position: {x: 1, y: 2},
          direction: "INVALID",
        } as unknown as RoverState;

        expect(() => step(corruptedState, Command.Move)).toThrow();
      });
    });
  });
});
