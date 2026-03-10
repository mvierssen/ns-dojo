import {describe, expect, it} from "vitest";
import type {Antenna} from "./ports/antenna.js";
import type {Printer} from "./ports/printer.js";
import {Transformer} from "./services/transformer.js";

// Given the antenna receives an end character
// When we print
// Then the printer, prints nothing
describe("Transformer", () => {
  class FakeAntenna implements Antenna {
    initialMessage: string;
    constructor(initialMessage: string) {
      this.initialMessage = initialMessage;
    }
    getMessage(): string {
      return this.initialMessage;
    }
  }

  class SpyPrinter implements Printer {
    printedMessage: string = "";
    print(message: string): void {
      this.printedMessage = message;
    }
  }

  describe("When printing", () => {
    it("Prints nothing given the antenna receives an end character", () => {
      const antenna = new FakeAntenna("/0");
      const printer = new SpyPrinter();

      const transformer = new Transformer(antenna, printer);

      transformer.transform();

      expect(printer.printedMessage).toBe("");
    });
  });
});
