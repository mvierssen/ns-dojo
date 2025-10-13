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
