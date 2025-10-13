import {
  DirectionSchema,
  type RoverState,
} from "@ns-white-crane-white-belt/smelly-mars-rover";
import {z} from "zod";
import type {ComponentType} from "../ecs/world.js";

/**
 * Rover component schema
 */
export const RoverSchema = z.object({
  /** Unique identifier for the rover */
  id: z.string(),
  /** Current rover state (position and direction) */
  state: z.object({
    position: z.object({
      x: z.number().int(),
      y: z.number().int(),
    }),
    direction: DirectionSchema,
  }),
  /** Queue of commands to execute */
  commandQueue: z.array(z.string()),
  /** Current command being executed (index in queue) */
  currentCommandIndex: z.number().int(),
  /** Rover color for visualization */
  color: z.number(),
  /** Animation state for smooth transitions */
  animationState: z
    .object({
      isAnimating: z.boolean(),
      progress: z.number().min(0).max(1),
      type: z.enum(["rotate", "move", "idle"]),
      startPosition: z.object({x: z.number(), y: z.number()}).optional(),
      targetPosition: z.object({x: z.number(), y: z.number()}).optional(),
      startRotation: z.number().optional(),
      targetRotation: z.number().optional(),
    })
    .optional(),
});

export type Rover = z.infer<typeof RoverSchema>;

/**
 * Component type identifier for rover
 */
export const ROVER_COMPONENT: ComponentType = "rover" as ComponentType;

/**
 * Creates a new rover component
 */
export function createRover(
  id: string,
  state: RoverState,
  color: number,
): Rover {
  return {
    id,
    state,
    commandQueue: [],
    currentCommandIndex: 0,
    color,
    animationState: {
      isAnimating: false,
      progress: 0,
      type: "idle",
    },
  };
}
