# @ns-dojo-scripts/monorepo

Monorepo management utilities for NS Dojo platform (TypeScript/Node.js).

## Overview

TypeScript port of shell-based monorepo management tools, providing dependency verification and validation for the services monorepo.

## Scripts

### verify-dependencies.ts

Verifies that `package.json`, `moon.yml`, and `tsconfig.json` are in sync according to NS Dojo monorepo dependency classification rules.

**Verification Rules:**

1. **Runtime dependencies** (imported in `src/`):
   - Must be in: `package.json` dependencies
   - Must be in: `moon.yml` dependsOn
   - Must be in: `tsconfig.json` references

2. **Build-time dependencies** (config packages in config files):
   - Must be in: `package.json` devDependencies
   - Must be in: `moon.yml` tasks.build.deps (with `:build` suffix)
   - Must be in: `tsconfig.json` references

3. **No unused dependencies** should be declared

## Usage

```bash
# Verify all packages
npm run verify-deps

# Using tsx directly
tsx scripts/packages/scripts-monorepo/src/verify-dependencies.ts

# Verify with limit (for testing)
tsx scripts/packages/scripts-monorepo/src/verify-dependencies.ts --limit 10

# Verify specific packages
tsx scripts/packages/scripts-monorepo/src/verify-dependencies.ts \
  config/astro-config-base

# Concise output (only show problems)
tsx scripts/packages/scripts-monorepo/src/verify-dependencies.ts --concise

# Using Moon
npx moon run scripts-monorepo:verify-deps
```

## Options

- `-h, --help` - Show help message
- `-l, --limit N` - Verify only first N packages
- `-c, --concise` - Concise output (only show problems)

## Environment Variables

- `VERIFY_LIMIT` - Alternative to `--limit` flag
- `DEBUG` - Enable debug output

## Exit Codes

- `0` - All packages have correct dependencies
- `1` - One or more packages have issues

## Examples

### Verify All Packages

```bash
tsx src/verify-dependencies.ts
```

Output:

```
Monorepo Dependency Verification
=================================

Finding packages...
Found 150 packages to verify

Processed 10/150 packages...
Processed 20/150 packages...
...
Finished processing all packages.

Summary
=======
Total packages checked: 150
✓ All packages have correct dependency declarations! ✅
```

### Find Issues in Specific Package

```bash
tsx src/verify-dependencies.ts config/astro-config-base
```

If issues found:

```
❌ config/astro-config-base - Runtime dependency issues
package.json dependencies mismatch:
  Missing in package.json dependencies:
    - shared-core
  Extra in package.json dependencies:
    + old-unused-package
```

### Concise Mode for CI/CD

```bash
tsx src/verify-dependencies.ts --concise
```

Output (only if issues found):

```
config/astro-config-base:

Runtime:
package.json dependencies mismatch:
  Missing in package.json dependencies:
    - shared-core

config/prettier-config:

Unused:
Unused in package.json devDependencies:
    - old-package
```

## Implementation Details

### monorepo-utils.ts

Utility module providing:

- **Import Extraction**: Parse TypeScript/JavaScript files for `@ns-dojo/*` imports
- **Config Detection**: Identify config-only packages (eslint-config-_, ts-config-_, etc.)
- **Dependency Parsing**: Extract dependencies from package.json, moon.yml, tsconfig.json
- **Comparison**: Diff utilities for finding missing/extra dependencies

### verify-dependencies.ts

Main verification script:

1. Find packages to verify (all or specified paths)
2. For each package:
   - Extract actual imports from `src/` (runtime deps)
   - Extract imports from config files (build deps)
   - Parse declared dependencies from config files
   - Verify alignment and report issues
3. Summary report with exit code

## Integration with Shell Version

This TypeScript implementation provides the same functionality as `scripts/monorepo/verify-dependencies.sh`:

- ✅ Identical verification rules
- ✅ Same output format
- ✅ Compatible exit codes
- ✅ All command-line options supported

**Advantages of TypeScript version:**

- Type safety catches errors at development time
- Better cross-platform support (Windows)
- Easier to maintain and extend
- IDE support with autocomplete
- Reusable utility functions

**When to use each:**

- **TypeScript (Node.js)**: Local development, debugging, extending functionality
- **Shell script**: CI/CD environments, quick checks, minimal dependencies

## Development

```bash
# Build
npm run build

# Type check
npm run check

# Format code
npm run fmt

# Lint
npm run lint

# Test
npm test

# Run with debug output
DEBUG=1 tsx src/verify-dependencies.ts --limit 5
```

## Dependencies

- `@ns-dojo-scripts/lib` - Core utilities (logging, path handling)
- `yaml` - YAML parsing for moon.yml

## Future Enhancements

Potential additions:

- [ ] Auto-fix mode to update config files
- [ ] JSON output for programmatic use
- [ ] Parallel package verification
- [ ] Watch mode for continuous verification
- [ ] Integration with `moon sync` for auto-fixing tsconfig.json
