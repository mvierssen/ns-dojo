# Tech Debt

Some notes on things that smell in this codebase and ideas for fixing them.

## The Smells

### Hardcoded column labels

**Where:** `src/board.ts` lines 64, 79

The string `"    1  2  3  4  5  6  7"` is copy-pasted in two places (`renderBoardWithLabels` and `renderBoardComplete`). Should probably just generate it from the COLUMN_LABELS array or at least extract to a constant.

Not urgent, but annoying.

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

### getCell throws instead of returning Result

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
