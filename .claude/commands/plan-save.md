---
description: "Create a detailed plan document to preserve work state for future continuation"
argument-hint: "[filename] [title]"
allowed-tools: ["Write", "Read", "Bash", "Glob"]
---

# /plan-save – Save Progress to a Plan

Creates a detailed markdown document to preserve the current work state, enabling continuation in a future session. By default, plans are saved to a `plans/` directory.

## Usage

```
/plan-save csrf-fixes "CSRF Implementation Analysis and Fixes"
/plan-save
```

## Arguments

- `filename` (optional): Name for the plan file (e.g., `csrf-fixes`). Auto-generated if not provided.
- `title` (optional): Title for the plan document.

## What this command does

1.  **Analyzes** the current conversation context.
2.  **Documents** the current status, findings, issues, proposed solutions, and next steps.
3.  **Saves** the analysis to a markdown file in the `plans/` directory.

## Document Structure

The generated document includes:

- **Overview**: Summary of the work and current status.
- **Key Findings**: Important insights and conclusions.
- **Issues & Solutions**: Problems found and their proposed fixes.
- **Roadmap**: Phased approach with next steps.
- **Files to Change**: List of relevant file locations.
- **Testing Strategy**: How to validate the implementation.
