# TODO

# DONE

## Version 0 -> 1 (Identifying smells)

- Auto fix with ESLint and Prettier.
- Added guards to pass strict ESLint and TypeScript rules.
- Annotated original `Rover.ts` with code smell comments.

## Version 1 -> 2 (Schema extraction)

- Added `schemas.ts` with Zod schemas for Heading, Command, Rover State and Start Position String.
- Added `types.ts` for inferred types.
- Changed property names in `RoverState` to `x`, `y`, `direction`.

## Version 2 -> 3 (Lookup Tables)

- Introduced `constants.ts` with TURN_LEFT, TURN_RIGHT, MOVE_VECTOR maps.
- Replace conditionals with data lookups.

## Version 3 -> 4 (Use more consistent naming)

- Renamed `direction` to `heading` etc. for consistency.

## Version 4 -> 5 (Functional refactor)

- Functional / immutable parallel change of Rover functionality.

## Version 5 -> 6 (Partial expand)

- Expand new functional implementation into legacy.
- Removed legacy rover state class.
