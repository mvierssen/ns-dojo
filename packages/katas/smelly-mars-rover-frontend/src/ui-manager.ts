import type {RoverState} from "@ns-white-crane-white-belt/smelly-mars-rover";
import type {EntityId} from "./ecs/entity.js";
import {createRoverUIElement} from "./factories/index.js";

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

    // Create rover UI element using factory
    const {element: roverElement, commandInput} = createRoverUIElement({
      roverId: id,
      roverNumber: this.nextRoverNumber++,
      color,
      initialState,
      onRemove: () => {
        this.removeRover(id);
      },
    });

    // Add to DOM
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
