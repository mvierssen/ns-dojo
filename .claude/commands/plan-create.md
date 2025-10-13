---
description: "Create an implementation plan from a specification document or requirements"
argument-hint: "[spec-file-or-requirements] [--interactive]"
allowed-tools:
  [
    "Write",
    "Read",
    "Bash",
    "Glob",
    "Task",
    "TodoWrite",
    "WebSearch",
    "WebFetch",
  ]
---

# /plan-create – Create Implementation Plan from Specification

Generates a comprehensive implementation plan from a specification document or a simple requirements text.

## Usage

```
/plan-create specs/user-authentication-system.md
/plan-create "Implement dark mode toggle with user preferences persistence"
/plan-create --interactive
```

## Arguments

- `spec-file-or-requirements` (optional): Path to a specification file or inline requirements. If not provided, prompts for details.
- `--interactive` (optional): Enable enhanced interactive mode with context-dependent technical clarifying questions.

## What this command does

1.  **Analyzes Specification**: Parses the input from a file or text.
2.  **Breaks Down Requirements**: Deconstructs the requirements into implementable phases.
3.  **Identifies Dependencies**: Pinpoints technical dependencies and integration points.
4.  **Generates Plan**: Creates a detailed implementation roadmap in a `plans/` directory, including phases, file structure, testing strategy, and risk assessment.
5.  **Creates To-do List**: Sets up an initial to-do list for immediate action.

## Enhanced Interactive Mode (`--interactive`)

When this flag is used, the command asks context-dependent technical questions to clarify ambiguity and refine the plan. The questions are tailored to the type of project (e.g., API, database, frontend) and cover topics like:

- **API Development**: Error handling strategy (HTTP codes vs. detailed objects), authentication approach (JWT vs. session).
- **Database Changes**: Migration strategy (blue-green vs. rolling), data consistency (strong vs. eventual).
- **Frontend Implementation**: State management (component state vs. Redux/Zustand), styling approach (CSS modules vs. Tailwind).
- **Security**: Authentication security (MFA vs. SSO), data protection (encryption at rest vs. E2E).
