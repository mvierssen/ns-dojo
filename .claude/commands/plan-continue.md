---
description: "Resume work from an existing plan document with full context loading"
argument-hint: "[document-path]"
---

# /plan-continue – Continue Progress from Plan

Resumes work from an existing plan document by loading its context and outlining the next steps.

## Usage

By default, this command looks for plans in a `plans/` directory.

```
/plan-continue csrf-implementation-plan.md
/plan-continue
```

## Arguments

- `document-path` (optional): Path to the plan document. If not provided, the command lists available plans to choose from.

## What this command does

1.  **Loads Plan**: Identifies and parses the target plan document.
2.  **Analyzes Context**: Extracts the current status, completed tasks, pending tasks, and success metrics.
3.  **Validates State**: Checks for file existence and runs tests to establish a baseline.
4.  **Provides Roadmap**: Creates a to-do list of pending tasks and identifies the immediate next steps.

## Output

The command provides a concise continuation briefing:

```markdown
# Continuing: [Plan Title]

## Current Status

- **Phase**: X of Y completed
- **Last Updated**: [Date]
- **Validation**: [Test status]

## Immediate Next Steps

1. [Priority task with file locations]
2. [Next priority task]

## Files to Work With

- `path/to/file1.ts` - [Description of needed changes]
```
