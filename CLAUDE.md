# NS White Crane White Belt Monorepo

A TypeScript/JavaScript monorepo using **Turborepo** with npm workspaces for intelligent build orchestration across all packages.

## Structure

### Subdirectories

- **`packages/`** contains all application and library packages.

## Guidelines

### Coding Standards

- @guidelines/general-coding-guidelines.md

### Technology Standards

- @guidelines/typescript-coding-guidelines.md

### Claude Code Workflow

- **Default to parallel:** Execute independent operations in one message with multiple tool calls.
- **Always parallelize:** File reads, searches (Grep/Glob), git ops, cross-package validation, analysis.
- **Only sequence when:** Builds depend (shared libs → dependents), git workflows (`git add && commit && push`), file edits → git ops.
- **Never parallelize:** Placeholders, dependent operations, or batch completions.
- **Delegate cycles:** Subagents run test/lint/build → fix → repeat until passing; main agent handles reasoning.
