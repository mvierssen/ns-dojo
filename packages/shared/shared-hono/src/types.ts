import type {Context, Env} from "hono";
import type {JwtVariables} from "./jwt.js";
import type {VersionVariables} from "./middleware.js";

/**
 * Standard context variables available in the app
 */
export interface AppVariables extends JwtVariables, VersionVariables {
  /** Request ID for tracing */
  requestId?: string;
  /** Additional app-specific variables */
  [key: string]: unknown;
}

/**
 * App-specific environment bindings
 * Extend this in your app for typed environment variables
 */
export interface AppEnv extends Env {
  Variables: AppVariables;
}

/**
 * Typed context for the application
 */
export type AppContext = Context<AppEnv>;

/**
 * Extract the validated input type from a route
 * Useful for testing and type inference
 */
export interface ValidatedInput<T extends "json" | "form" | "query" | "param"> {
  in: Record<T, unknown>;
  out: Record<T, unknown>;
}

/**
 * Handler type with typed context and input
 */
export type TypedHandler<
  I extends ValidatedInput<"json" | "form" | "query" | "param">,
  O = unknown,
> = (
  c: Context<Env & {in: I["in"]; out: I["out"]}>,
) => Promise<Response | O> | Response | O;
