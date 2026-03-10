import type {Antenna} from "../ports/antenna.js";
import type {Printer} from "../ports/printer.js";

export class Transformer {
  antenna: Antenna;
  printer: Printer;
  constructor(antenna: Antenna, printer: Printer) {
    this.antenna = antenna;
    this.printer = printer;
  }

  transform(): void {}
}
