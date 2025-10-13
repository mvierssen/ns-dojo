import type {RoverState} from "@ns-white-crane-white-belt/smelly-mars-rover";

/**
 * Factory for creating rover UI elements
 */

/**
 * Options for creating a rover UI element
 */
export interface RoverUIElementOptions {
  roverId: string;
  roverNumber: number;
  color: number;
  initialState: RoverState;
  onRemove: () => void;
}

/**
 * Result of creating a rover UI element
 */
export interface RoverUIElementResult {
  element: HTMLDivElement;
  commandInput: HTMLInputElement;
}

/**
 * Converts a numeric color to hex string
 *
 * @param color - Numeric color value
 * @returns Hex color string (e.g., "#4488ff")
 */
export function colorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

/**
 * Creates a color indicator element
 *
 * @param color - Numeric color value
 * @returns HTMLDivElement color indicator
 */
function createColorIndicator(color: number): HTMLDivElement {
  const colorIndicator = document.createElement("div");
  colorIndicator.className = "rover-color";
  colorIndicator.style.backgroundColor = colorToHex(color);
  return colorIndicator;
}

/**
 * Creates a rover info section
 *
 * @param roverNumber - Display number for the rover
 * @param initialState - Initial rover state
 * @returns HTMLDivElement containing rover info
 */
function createRoverInfo(
  roverNumber: number,
  initialState: RoverState,
): HTMLDivElement {
  const roverInfo = document.createElement("div");
  roverInfo.className = "rover-info";

  const roverName = document.createElement("h3");
  roverName.textContent = `Rover ${String(roverNumber)}`;

  const roverPosition = document.createElement("p");
  roverPosition.className = "rover-position";
  roverPosition.textContent = `Position: ${String(initialState.position.x)}, ${String(initialState.position.y)} ${initialState.direction}`;

  roverInfo.append(roverName, roverPosition);
  return roverInfo;
}

/**
 * Creates a remove button
 *
 * @param onRemove - Callback when remove button is clicked
 * @returns HTMLButtonElement remove button
 */
function createRemoveButton(onRemove: () => void): HTMLButtonElement {
  const removeBtn = document.createElement("button");
  removeBtn.className = "rover-remove-btn";
  removeBtn.textContent = "×";
  removeBtn.title = "Remove rover";
  removeBtn.addEventListener("click", onRemove);
  return removeBtn;
}

/**
 * Creates a command input element
 *
 * @returns HTMLInputElement command input
 */
function createCommandInput(): HTMLInputElement {
  const commandInput = document.createElement("input");
  commandInput.type = "text";
  commandInput.className = "rover-command-input";
  commandInput.placeholder = "Enter commands (e.g., LMLMLMLMM)";
  commandInput.maxLength = 100;
  return commandInput;
}

/**
 * Creates a complete rover UI element with all components
 *
 * @param options - Options for creating the UI element
 * @returns Rover UI element and command input reference
 */
export function createRoverUIElement(
  options: RoverUIElementOptions,
): RoverUIElementResult {
  const {roverId, roverNumber, color, initialState, onRemove} = options;

  // Create rover UI element
  const roverElement = document.createElement("div");
  roverElement.className = "rover-item";
  roverElement.dataset.roverId = roverId;

  // Create components
  const colorIndicator = createColorIndicator(color);
  const roverInfo = createRoverInfo(roverNumber, initialState);
  const removeBtn = createRemoveButton(onRemove);

  // Header row (color + info + remove button)
  const headerRow = document.createElement("div");
  headerRow.className = "rover-header";
  headerRow.append(colorIndicator, roverInfo, removeBtn);

  // Command input
  const commandInput = createCommandInput();

  // Assemble rover element
  roverElement.append(headerRow, commandInput);

  return {element: roverElement, commandInput};
}
