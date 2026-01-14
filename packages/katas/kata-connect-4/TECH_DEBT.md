# Tech Debt

Some notes on things that smell in this codebase and ideas for fixing them.

## The Smells

### Hardcoded column labels - DONE

**Where:** `src/board.ts` lines 64, 79

The string `"    1  2  3  4  5  6  7"` is copy-pasted in two places (`renderBoardWithLabels` and `renderBoardComplete`). Should probably just generate it from the COLUMN_LABELS array or at least extract to a constant.

Extract to a constant or generate from the array.

---

### Game class is doing too much

**Where:** `src/game.ts`

It's called a "Facade" but it's really doing:
- Storing state (the board)
- Rendering (displayBoard)
- Validating input
- Delegating game logic

A facade should just coordinate, not hold state or do validation. Makes testing awkward too.

---

### getCell throws instead of returning Result - DONE

**Where:** `src/board.ts` lines 28-40

Everything else in this codebase uses Result types for errors, but `getCell` throws an exception. Inconsistent and breaks the functional composition pattern.

Should change to `Result<CellState>` to match the rest.

---

### CLI mixes formatting with game logic

**Where:** `src/cli.ts`

This file has:
- Pure formatting functions (formatWelcome, formatBoard, formatError, etc.)
- The GameLoop class which manages player turns

Player turn management is game logic, not CLI stuff. Should be separate.

---

### board.ts is a kitchen sink

**Where:** `src/board.ts`

This one file handles:
- Creating boards
- Cell access/mutation
- Rendering (multiple functions)
- Game logic (dropCoin, findLowestEmptyRow, etc.)
- Input parsing

Way too many reasons to change. Should split into focused modules.

---

### Column numbers are just numbers

**Where:** throughout

Column values are plain `number` everywhere. Could use a branded type to catch invalid columns at compile time instead of runtime.

Low priority since runtime validation exists, but would be nice.

---

### GameLoop depends on concrete Game

**Where:** `src/cli.ts` line 16

`constructor(private game: Game) {}` takes a concrete class, not an interface. Makes it harder to test with mocks.

---

### Tests mutate arrays directly

**Where:** `src/board.test.ts`, `src/game.test.ts`

Lots of tests do stuff like:
```typescript
const row = board.cells[5];
if (row) row[0] = CellState.Player1;
```

Brittle and verbose. Should have test builders that use domain operations instead.

---

### No win detection

**Where:** nowhere (that's the problem)

The game says "Get 4 in a row to win" but there's no code to actually detect wins. Game just keeps going forever. This is the biggest gap, the game isn't really playable without it.

---

## What to fix and when

Rough plan for tackling this stuff:

### Start with the easy wins

Fix the duplicated column labels first. Quick, low risk, and removes the most obvious smell.

### Then standardize error handling

Change `getCell` to return Result. This should happen before bigger refactors so we're not rewriting things twice.

### Split up the big modules

1. Break up `board.ts` into core/render/logic pieces
2. Pull game logic out of `cli.ts`
3. Clean up the Game class to be a proper facade

Order matters here, do board.ts first since the others depend on it.

### Add the branded Column type

Once the module structure is stable, add the Column type. Doing it earlier would mean updating it during all the refactoring.

### Clean up tests

Create proper test builders to replace the manual array mutations. Wait until after the refactoring settles down.

### Finally, add win detection

Implement horizontal, vertical, and diagonal checks. Easier to do after the architecture is cleaned up. Should also add the IGame interface at this point since we'll know the full API by then.
