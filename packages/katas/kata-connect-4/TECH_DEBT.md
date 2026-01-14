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
