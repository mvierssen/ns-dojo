# Tech Debt

Some notes on things that smell in this codebase and ideas for fixing them.

## The Smells

### Hardcoded column labels

**Where:** `src/board.ts` lines 64, 79

The string `"    1  2  3  4  5  6  7"` is copy-pasted in two places (`renderBoardWithLabels` and `renderBoardComplete`). Should probably just generate it from the COLUMN_LABELS array or at least extract to a constant.

Not urgent, but annoying.
