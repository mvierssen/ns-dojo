---
description: "Generate a new package using an existing template"
argument-hint: "[template-name] [package-name] [--interactive]"
---

# /template-scaffold – Generate Package from Template

Creates a new package from an existing template, automatically handling naming, dependencies, configurations, and integration with the monorepo build system.

## Usage

```
# Quick scaffolding
/template-scaffold website my-new-website
/template-scaffold api analytics-api

# Interactive mode for guided setup
/template-scaffold --interactive
```

## Arguments

- `template-name` (optional): The template to use (e.g., `website`, `api`). If omitted, a list of available templates is shown.
- `package-name` (required): The name for the new package.
- `--interactive` (optional): Use interactive mode for guided configuration.

## Workflow

### 1. Template Selection

- In interactive mode, it presents a list of available templates.
- Otherwise, it uses the specified `template-name`.

### 2. Configuration

- Gathers configuration details for the new package, such as name, dependencies, and optional features. This is done interactively if `--interactive` is used.

### 3. Generation

- **Copies Template**: Clones the selected template package as a base.
- **Applies Configuration**: Replaces placeholders (e.g., `{{PACKAGE_NAME}}`) with the actual values.
- **Updates Dependencies**: Sets the correct name and dependencies in `package.json`.
- **Customizes Configs**: Updates build tool configurations (e.g., Vite, Astro), TypeScript paths, and Docker files.

### 4. Integration & Validation

- **Integrates with Monorepo**: Adds the new package to the workspace configuration and build pipeline.
- **Validates**: Runs `npm install` and a build step to verify that the new package is correctly configured.
