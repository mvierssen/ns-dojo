# TODO

- Barrel export
- Create frontend (with AI)
- Expand new implementation, remove legacy (which is now a facade)
- Trying to achieve 100% code coverage revealed that the contract for the public legacy method G was broken. Find out if G should be removed.

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

## Version 6 -> 7 (Use constants for directions and commands)

- Even though the directions and input characters are now fully typed, use enums or constants for them

## Version 7 -> 8 (Fully declarative)

- Make code more declarative by using a handler map for commands instead of a switch statement

## Version 8 -> 9 (Full coverage)

- Achieve 100% code coverage with tests
- Add test to cover G, which was previously not covered

## Version 9 -> 10 (Mutation testing)

- Add Stryker mutation testing

## Version 10 -> 11 (Result type, safe run and step functions)

- Introduce Result type for operations that can fail
- Added parallel change safeRun and safeStep functions that use Result types
