import type {RoverState} from "@ns-white-crane-white-belt/smelly-mars-rover";
import type {EntityId} from "./ecs/entity.js";

/**
 * Rover UI state
 */
export interface RoverUIState {
  id: string;
  entityId: EntityId;
  color: number;
  element: HTMLDivElement;
  commandInput: HTMLInputElement;
}

/**
 * UI Manager for handling dynamic rover controls
 */
export class UIManager {
  private rovers = new Map<string, RoverUIState>();
  private roversList: HTMLElement;
  private nextRoverNumber = 1;
  private onRemoveCallback?: (roverId: string, entityId: EntityId) => void;

  constructor() {
    const roversList = document.querySelector("#rovers-list");
    if (!roversList) throw new Error("Rovers list element not found");
    this.roversList = roversList as HTMLElement;
  }

  /**
   * Sets callback for when a rover is removed via UI
   */
  setOnRemoveCallback(
    callback: (roverId: string, entityId: EntityId) => void,
  ): void {
    this.onRemoveCallback = callback;
  }

  /**
   * Adds a rover to the UI
   */
  addRover(
    id: string,
    entityId: EntityId,
    color: number,
    initialState: RoverState,
  ): void {
    if (this.rovers.has(id)) return;

    // Create rover UI element
    const roverElement = document.createElement("div");
    roverElement.className = "rover-item";
    roverElement.dataset.roverId = id;

    // Color indicator
    const colorHex = `#${color.toString(16).padStart(6, "0")}`;
    const colorIndicator = document.createElement("div");
    colorIndicator.className = "rover-color";
    colorIndicator.style.backgroundColor = colorHex;

    // Rover info
    const roverInfo = document.createElement("div");
    roverInfo.className = "rover-info";

    const roverName = document.createElement("h3");
    roverName.textContent = `Rover ${String(this.nextRoverNumber++)}`;

    const roverPosition = document.createElement("p");
    roverPosition.className = "rover-position";
    roverPosition.textContent = `Position: ${String(initialState.position.x)}, ${String(initialState.position.y)} ${initialState.direction}`;

    roverInfo.append(roverName, roverPosition);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "rover-remove-btn";
    removeBtn.textContent = "×";
    removeBtn.title = "Remove rover";
    removeBtn.addEventListener("click", () => {
      this.removeRover(id);
    });

    // Header row (color + info + remove button)
    const headerRow = document.createElement("div");
    headerRow.className = "rover-header";
    headerRow.append(colorIndicator, roverInfo, removeBtn);

    // Command input
    const commandInput = document.createElement("input");
    commandInput.type = "text";
    commandInput.className = "rover-command-input";
    commandInput.placeholder = "Enter commands (e.g., LMLMLMLMM)";
    commandInput.maxLength = 100;

    // Assemble rover element
    roverElement.append(headerRow, commandInput);
    this.roversList.appendChild(roverElement);

    // Store state
    this.rovers.set(id, {
      id,
      entityId,
      color,
      element: roverElement,
      commandInput,
    });
  }

  /**
   * Removes a rover from the UI
   */
  removeRover(id: string): void {
    const rover = this.rovers.get(id);
    if (!rover) return;

    // Call the callback to remove from world
    if (this.onRemoveCallback) {
      this.onRemoveCallback(id, rover.entityId);
    }

    rover.element.remove();
    this.rovers.delete(id);
  }

  /**
   * Updates a rover's position display
   */
  updateRoverPosition(id: string, state: RoverState): void {
    const rover = this.rovers.get(id);
    if (!rover) return;

    const positionElement = rover.element.querySelector(".rover-position");
    if (positionElement) {
      positionElement.textContent = `Position: ${String(state.position.x)}, ${String(state.position.y)} ${state.direction}`;
    }
  }

  /**
   * Gets all rover command strings
   */
  getAllCommands(): Map<string, string> {
    const commands = new Map<string, string>();
    for (const [id, rover] of this.rovers.entries()) {
      const commandStr = rover.commandInput.value.trim().toUpperCase();
      if (commandStr) {
        commands.set(id, commandStr);
      }
    }
    return commands;
  }

  /**
   * Clears all command inputs
   */
  clearAllCommands(): void {
    for (const rover of this.rovers.values()) {
      rover.commandInput.value = "";
    }
  }

  /**
   * Clears all rovers from the UI
   */
  clearAll(): void {
    for (const rover of this.rovers.values()) {
      rover.element.remove();
    }
    this.rovers.clear();
    this.nextRoverNumber = 1;
  }

  /**
   * Gets all rover entity IDs
   */
  getAllRoverIds(): string[] {
    return [...this.rovers.keys()];
  }

  /**
   * Gets entity ID for a rover ID
   */
  getEntityId(roverId: string): EntityId | undefined {
    return this.rovers.get(roverId)?.entityId;
  }
}
