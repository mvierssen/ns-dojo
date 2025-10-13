import {
  CommandEnum,
  DirectionEnum,
  step,
  type RoverState,
} from "@ns-white-crane-white-belt/smelly-mars-rover";
import {
  MESH_COMPONENT,
  TRANSFORM_COMPONENT,
  type Mesh,
  type Transform,
} from "../components/index.js";
import {getComponent} from "../ecs/component.js";
import type {EntityId} from "../ecs/entity.js";
import type {World} from "../ecs/world.js";
import type {ScriptFn} from "../components/script.js";

/**
 * Configuration for rover animation script
 */
export interface RoverAnimationConfig {
  id: string;
  initialState: RoverState;
  color: number;
  animationSpeed?: number;
}

/**
 * Animation state for smooth transitions
 */
interface AnimationState {
  isAnimating: boolean;
  progress: number;
  type: "rotate" | "move" | "idle";
  startPosition?: {x: number; y: number};
  targetPosition?: {x: number; y: number};
  startRotation?: number;
  targetRotation?: number;
}

/**
 * Enhanced script interface for rover animation
 */
export interface RoverAnimationScript {
  scriptFn: ScriptFn;
  setCommands: (commands: string) => void;
  getState: () => RoverState;
  getId: () => string;
  getColor: () => number;
}

/**
 * Maps rover direction to 3D rotation (in radians, around Y axis)
 */
const DIRECTION_TO_ROTATION: Record<string, number> = {
  [DirectionEnum.North]: 0,
  [DirectionEnum.East]: Math.PI / 2,
  [DirectionEnum.South]: Math.PI,
  [DirectionEnum.West]: (3 * Math.PI) / 2,
};

/**
 * Linearly interpolates between two values
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Normalizes an angle to be within [0, 2π)
 */
function normalizeAngle(angle: number): number {
  let normalized = angle % (2 * Math.PI);
  if (normalized < 0) normalized += 2 * Math.PI;
  return normalized;
}

/**
 * Interpolates between two angles taking the shortest path
 * Returns the interpolated angle
 */
function lerpAngle(from: number, to: number, t: number): number {
  // Normalize both angles to [0, 2π)
  const fromNorm = normalizeAngle(from);
  const toNorm = normalizeAngle(to);

  // Calculate the difference
  let diff = toNorm - fromNorm;

  // Take the shorter path around the circle
  if (diff > Math.PI) {
    diff -= 2 * Math.PI;
  } else if (diff < -Math.PI) {
    diff += 2 * Math.PI;
  }

  // Interpolate using the shortest difference
  return fromNorm + diff * t;
}

/**
 * Creates a rover animation script that processes command queues and animates smooth transitions
 */
export function createRoverAnimationScript(
  config: RoverAnimationConfig,
): RoverAnimationScript {
  const {id, initialState, color, animationSpeed = 2} = config;

  // Animation speed configuration
  const ROTATION_SPEED = Math.PI * animationSpeed; // radians per second
  const MOVE_SPEED = 3 * animationSpeed; // units per second

  // Mutable state stored in closure
  let roverState: RoverState = {...initialState};
  let commandQueue: string[] = [];
  let currentCommandIndex = 0;
  let animationState: AnimationState = {
    isAnimating: false,
    progress: 0,
    type: "idle",
  };

  /**
   * Updates an ongoing animation
   */
  function updateAnimation(
    transform: Transform,
    mesh: Mesh,
    deltaTime: number,
  ): void {
    const {type, progress} = animationState;

    // Calculate animation progress based on type
    let progressIncrement = 0;
    if (type === "rotate") {
      progressIncrement = (ROTATION_SPEED * deltaTime) / (Math.PI / 2); // 90 degree turn
    } else if (type === "move") {
      progressIncrement = MOVE_SPEED * deltaTime;
    }

    const newProgress = Math.min(progress + progressIncrement, 1);
    animationState.progress = newProgress;

    // Apply animation based on type
    if (type === "rotate" && animationState.targetRotation !== undefined) {
      const startRot = animationState.startRotation ?? transform.rotation.y;
      const targetRot = animationState.targetRotation;
      // Use lerpAngle to properly interpolate taking the shortest path
      transform.rotation.y = lerpAngle(startRot, targetRot, newProgress);
      mesh.object3D.rotation.y = transform.rotation.y;
    } else if (
      type === "move" &&
      animationState.startPosition &&
      animationState.targetPosition
    ) {
      const {startPosition, targetPosition} = animationState;
      transform.position.x = lerp(startPosition.x, targetPosition.x, newProgress);
      transform.position.z = lerp(startPosition.y, targetPosition.y, newProgress);
      mesh.object3D.position.x = transform.position.x;
      mesh.object3D.position.z = transform.position.z;
    }

    // Check if animation is complete
    if (newProgress >= 1) {
      animationState.isAnimating = false;
      animationState.progress = 0;
      animationState.type = "idle";
      currentCommandIndex++;
    }
  }

  /**
   * Starts a new command animation
   */
  function startCommandAnimation(transform: Transform, commandChar: string): void {
    // Parse command
    let command: CommandEnum;
    switch (commandChar) {
      case "L": {
        command = CommandEnum.Left;
        break;
      }
      case "R": {
        command = CommandEnum.Right;
        break;
      }
      case "M": {
        command = CommandEnum.Move;
        break;
      }
      default: {
        // Invalid command, skip
        currentCommandIndex++;
        return;
      }
    }

    // Execute command on rover state
    const newState = step(roverState, command);

    // Set up animation based on command type
    if (command === CommandEnum.Left || command === CommandEnum.Right) {
      // Rotation animation
      animationState.type = "rotate";
      animationState.startRotation = transform.rotation.y;
      animationState.targetRotation =
        DIRECTION_TO_ROTATION[newState.direction] ?? 0;
    } else {
      // Movement animation (CommandEnum.Move)
      animationState.type = "move";
      animationState.startPosition = {
        x: transform.position.x,
        y: transform.position.z, // 3D z maps to rover y
      };
      animationState.targetPosition = {
        x: newState.position.x,
        y: newState.position.y,
      };
    }

    animationState.isAnimating = true;
    animationState.progress = 0;

    // Update rover state
    roverState = newState;
  }

  /**
   * Main update function called every frame
   */
  const scriptFn: ScriptFn = (
    world: World,
    entityId: EntityId,
    deltaTime: number,
  ): void => {
    const transform = getComponent(world, entityId, TRANSFORM_COMPONENT) as
      | Transform
      | undefined;
    const mesh = getComponent(world, entityId, MESH_COMPONENT) as
      | Mesh
      | undefined;

    if (!transform || !mesh) return;

    // If currently animating, update animation
    if (animationState.isAnimating) {
      updateAnimation(transform, mesh, deltaTime);
      return;
    }

    // If not animating and have commands, start next command animation
    if (currentCommandIndex < commandQueue.length) {
      const commandChar = commandQueue[currentCommandIndex];
      if (commandChar) {
        startCommandAnimation(transform, commandChar);
      }
    }
  };

  /**
   * Sets new command queue and resets animation
   */
  const setCommands = (commands: string): void => {
    commandQueue = commands.split("");
    currentCommandIndex = 0;
    animationState = {
      isAnimating: false,
      progress: 0,
      type: "idle",
    };
  };

  /**
   * Gets current rover state
   */
  const getState = (): RoverState => {
    return {...roverState};
  };

  /**
   * Gets rover ID
   */
  const getId = (): string => {
    return id;
  };

  /**
   * Gets rover color
   */
  const getColor = (): number => {
    return color;
  };

  return {
    scriptFn,
    setCommands,
    getState,
    getId,
    getColor,
  };
}
