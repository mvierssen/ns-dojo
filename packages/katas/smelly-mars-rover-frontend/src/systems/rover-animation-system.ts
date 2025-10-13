import {
  CommandEnum,
  DirectionEnum,
  step,
} from "@ns-white-crane-white-belt/smelly-mars-rover";
import {
  MESH_COMPONENT,
  ROVER_COMPONENT,
  TRANSFORM_COMPONENT,
  type Mesh,
  type Rover,
  type Transform,
} from "../components/index.js";
import {getComponent} from "../ecs/component.js";
import {queryEntities} from "../ecs/query.js";
import type {World} from "../ecs/world.js";

/**
 * Animation speed configuration
 */
const ANIMATION_SPEED = 2; // Speed multiplier for animations
const ROTATION_SPEED = Math.PI * ANIMATION_SPEED; // radians per second
const MOVE_SPEED = 3 * ANIMATION_SPEED; // units per second

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
 * Rover Animation System
 * Processes rover command queues and animates smooth transitions
 */
export function roverAnimationSystem(world: World, deltaTime: number): void {
  const roverEntities = queryEntities(world, [
    ROVER_COMPONENT,
    TRANSFORM_COMPONENT,
    MESH_COMPONENT,
  ]);

  for (const entityId of roverEntities) {
    const rover = getComponent(world, entityId, ROVER_COMPONENT) as
      | Rover
      | undefined;
    const transform = getComponent(world, entityId, TRANSFORM_COMPONENT) as
      | Transform
      | undefined;
    const mesh = getComponent(world, entityId, MESH_COMPONENT) as
      | Mesh
      | undefined;

    if (!rover || !transform || !mesh) continue;

    // Initialize animation state if needed
    rover.animationState ??= {
      isAnimating: false,
      progress: 0,
      type: "idle",
    };

    // If currently animating, update animation
    if (rover.animationState.isAnimating) {
      updateAnimation(rover, transform, mesh, deltaTime);
      continue;
    }

    // If not animating and have commands, start next command animation
    if (rover.currentCommandIndex < rover.commandQueue.length) {
      const commandChar = rover.commandQueue[rover.currentCommandIndex];
      if (commandChar) {
        startCommandAnimation(rover, transform, commandChar);
      }
    }
  }
}

/**
 * Updates an ongoing animation
 */
function updateAnimation(
  rover: Rover,
  transform: Transform,
  mesh: Mesh,
  deltaTime: number,
): void {
  if (!rover.animationState) return;

  const {type, progress} = rover.animationState;

  // Calculate animation progress based on type
  let progressIncrement = 0;
  if (type === "rotate") {
    progressIncrement = (ROTATION_SPEED * deltaTime) / (Math.PI / 2); // 90 degree turn
  } else if (type === "move") {
    progressIncrement = MOVE_SPEED * deltaTime;
  }

  const newProgress = Math.min(progress + progressIncrement, 1);
  rover.animationState.progress = newProgress;

  // Apply animation based on type
  if (type === "rotate" && rover.animationState.targetRotation !== undefined) {
    const startRot = rover.animationState.startRotation ?? transform.rotation.y;
    const targetRot = rover.animationState.targetRotation;
    // Use lerpAngle to properly interpolate taking the shortest path
    transform.rotation.y = lerpAngle(startRot, targetRot, newProgress);
    mesh.object3D.rotation.y = transform.rotation.y;
  } else if (
    type === "move" &&
    rover.animationState.startPosition &&
    rover.animationState.targetPosition
  ) {
    const {startPosition, targetPosition} = rover.animationState;
    transform.position.x = lerp(startPosition.x, targetPosition.x, newProgress);
    transform.position.z = lerp(startPosition.y, targetPosition.y, newProgress);
    mesh.object3D.position.x = transform.position.x;
    mesh.object3D.position.z = transform.position.z;
  }

  // Check if animation is complete
  if (newProgress >= 1) {
    rover.animationState.isAnimating = false;
    rover.animationState.progress = 0;
    rover.animationState.type = "idle";
    rover.currentCommandIndex++;
  }
}

/**
 * Starts a new command animation
 */
function startCommandAnimation(
  rover: Rover,
  transform: Transform,
  commandChar: string,
): void {
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
      rover.currentCommandIndex++;
      return;
    }
  }

  // Execute command on rover state
  const newState = step(rover.state, command);

  rover.animationState ??= {
    isAnimating: false,
    progress: 0,
    type: "idle",
  };

  // Set up animation based on command type
  if (command === CommandEnum.Left || command === CommandEnum.Right) {
    // Rotation animation
    rover.animationState.type = "rotate";
    rover.animationState.startRotation = transform.rotation.y;
    rover.animationState.targetRotation =
      DIRECTION_TO_ROTATION[newState.direction] ?? 0;
  } else {
    // Movement animation (CommandEnum.Move)
    rover.animationState.type = "move";
    rover.animationState.startPosition = {
      x: transform.position.x,
      y: transform.position.z, // 3D z maps to rover y
    };
    rover.animationState.targetPosition = {
      x: newState.position.x,
      y: newState.position.y,
    };
  }

  rover.animationState.isAnimating = true;
  rover.animationState.progress = 0;

  // Update rover state
  rover.state = newState;
}
