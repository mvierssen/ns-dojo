---
description: "Update a plan document with the latest implementation status and test results"
argument-hint: "[document-path]"
allowed-tools: ["Read", "Edit", "Bash", "Glob"]
---

# /plan-update – Update Plan Progress

Updates a plan document with the latest implementation status, test results, and progress. By default, looks for plans in a `plans/` directory.

## Usage

```
/plan-update csrf-implementation-plan.md
/plan-update
```

## Arguments

- `document-path` (optional): Path to the plan document to update. If not provided, it will search for relevant documents based on the current context.

## What this command does

1.  **Identifies** the target plan document.
2.  **Runs validation tests** to get the latest status.
3.  **Updates status sections** with progress, test results, and files modified.
4.  **Timestamps** the update for progress tracking.

## Status Update Format

The command adds or updates an **Implementation Status** section:

```markdown
## Implementation Status Update (YYYY-MM-DD)

- **Phase**: [Status of the current phase]
- **Summary**: [Key changes and their status]
- **Files Modified**: [List of changed files]
- **Validation**: [Test results and metrics]
- **Next Steps**: [Pending or blocked items]
```
