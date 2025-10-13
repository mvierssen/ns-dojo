# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo managed with npm workspaces and Turbo, focused on kata/coding exercise projects with shared configurations and utilities. The repository uses a structured approach with reusable config packages, shared libraries, templates, and kata implementations.

## Repository Structure

### Package Organization

The monorepo is organized into four main categories under `packages/`:

- **`packages/config/`** - Reusable configuration packages for the entire monorepo:
  - `eslint-config-base`, `eslint-config-node` - ESLint configurations
  - `prettier-config` - Prettier configuration
  - `stryker-config` - Mutation testing configuration
  - `ts-config-*` - TypeScript configurations for different build scenarios (base, build, lib-compiled, lib-source, node)
  - `vite-config-base` - Vite build configuration
  - `vitest-config-*` - Vitest test configurations (base, node, jsdom)

- **`packages/shared/`** - Shared utility libraries used across katas:
  - `shared-core` - Core utilities and types
  - `shared-vite` - Vite-related utilities
  - `shared-zod` - Zod schema utilities

- **`packages/templates/`** - Starter templates for new projects:
  - `template-base` - Base template
  - `template-vite` - Vite-based template

- **`packages/katas/`** - Individual kata/exercise implementations:
  - `smelly-mars-rover` - Example kata implementation

### TypeScript Project References

This monorepo uses TypeScript project references (defined in root `tsconfig.json`) to manage dependencies between packages. All packages must be listed in the root `tsconfig.json` references array to be included in the build graph.

## Common Commands

### Building

```bash
npm run build              # Build all packages via Turbo
turbo build                # Same as above
```

Individual packages can be built by running `npm run build` within their directory.

### Testing

```bash
npm test                   # Run tests in all packages
npm run test:watch         # Run tests in watch mode
npm run coverage           # Generate test coverage reports
npm run test:mutation      # Run mutation testing with Stryker
```

For single tests in a specific package:
```bash
cd packages/katas/smelly-mars-rover
npm run test:vitest        # Run all tests
vitest run <test-file>     # Run specific test file
```

### Linting and Formatting

```bash
npm run lint               # Lint all packages
npm run lint:fix           # Auto-fix linting issues
npm run fmt                # Format all code with Prettier
npm run fmt:check          # Check formatting without changes
```

### Type Checking

```bash
npm run typecheck          # Type check all packages
```

### Combined Workflows

```bash
npm run check:all          # Run lint and typecheck on all packages
npm run check:fast         # Run lint:fix and typecheck with --continue flag (faster, doesn't stop on errors)
npm run check:changed      # Run lint:fix, typecheck, test, build, fmt on packages changed since HEAD~1
npm run fix:changed        # Run lint:fix and fmt on packages changed since HEAD~1
```

### Development

```bash
npm run dev                # Start development mode for all applicable packages
```

### Dependency Management

```bash
npm run deps:check         # Check for outdated dependencies across all workspaces
npm run deps:update        # Update dependencies (excludes specific eslint packages)
```

## Development Workflow

### Git Hooks

The repository uses Husky for git hooks:
- **pre-commit**: Runs `turbo lint typecheck --filter='[HEAD~1]' --continue --concurrency=4 --output-logs=errors-only` to validate changed packages

### Commit Conventions

Uses commitlint with conventional commit format. The configuration disables max length checks for headers, body, and footer.

## Package Structure and Conventions

### Standard Package Layout

Each package follows this structure:
```
package-name/
├── src/              # Source TypeScript files
├── dist/             # Compiled output (generated)
├── package.json      # Package configuration
├── tsconfig.json     # TypeScript configuration
├── vitest.config.ts  # Vitest configuration (if tests exist)
└── eslint.config.*   # ESLint configuration (inherits from shared config)
```

### Package Export Conventions

All packages use a consistent export pattern in `package.json`:
```json
"exports": {
  "./package.json": "./package.json",
  ".": {
    "types": "./dist/src/index.d.ts",
    "node": "./dist/src/index.js",
    "import": {
      "@ns-white-crane-white-belt/source": "./src/index.ts",
      "default": "./dist/src/index.js"
    }
  },
  "./*": {
    "types": "./dist/src/*.d.ts",
    "node": "./dist/src/*.js",
    "import": {
      "@ns-white-crane-white-belt/source": "./src/*.ts",
      "default": "./dist/src/*.js"
    }
  }
}
```

The `@ns-white-crane-white-belt/source` condition allows importing source TypeScript files directly during development.

### Standard Package Scripts

All packages implement these npm scripts:
- `build` - Build the package (`tsc --build`)
- `test` / `test:vitest` - Run tests
- `coverage` / `coverage:vitest` - Generate coverage reports
- `lint` / `lint:eslint` - Lint code
- `lint:fix` - Auto-fix linting issues
- `fmt` / `fmt:prettier` - Format code
- `fmt:check` / `fmt:check:prettier` - Check formatting
- `typecheck` / `typecheck:tsc` - Type check code

## Architecture Decisions

### ESLint Configuration

The base ESLint config (`packages/config/eslint-config-base`) is comprehensive and includes:
- TypeScript strict and stylistic type checking
- Unicorn, SonarJS, Security, and RegExp plugins
- Special handling for test files, scripts, config files, and type definitions
- Type-checked rules disabled for config files, scripts, and type definition files
- Automatic .gitignore integration

### Testing Strategy

- Uses Vitest as the primary test runner
- Separate Vitest configurations for Node and JSDOM environments
- Mutation testing available via Stryker
- Coverage reports generated in `coverage/` directories

### Build System

- Turbo handles task orchestration and caching
- TypeScript project references manage inter-package dependencies
- Packages build to `dist/` directories
- Build outputs are git-ignored but included in package files

## Creating New Katas

When creating a new kata package:

1. Copy from `packages/templates/template-base` or `packages/templates/template-vite`
2. Update `package.json` name to `@ns-white-crane-white-belt/<kata-name>`
3. Add the package reference to root `tsconfig.json`
4. Add any required dependencies (e.g., `@ns-white-crane-white-belt/shared-core`)
5. Implement your kata in `src/`
6. Run `npm run build` from the root to ensure it's in the build graph

## Important Notes

- All packages are marked as `private: true` - this is an internal monorepo
- Package manager is locked to npm@10.9.0 via `packageManager` field
- The project uses ES modules (`"type": "module"`)
- Turbo caching is configured with remote cache signature support
- Test files follow the pattern `*.test.{ts,tsx}` or `*.spec.{ts,tsx}`
