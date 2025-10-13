# TypeScript Coding Guidelines

Requirements

- Node.js ESM, TypeScript ≥ 5.8, Vitest ≥ 3, Zod ≥ 4.

Essentials

- Strict: Enable strict flags; avoid `@ts-ignore` except with comment+issue.
- Types: Prefer explicit public types; use `unknown` over `any`.
- Imports: Prefer named ESM imports; use `import type` for types.
- Async: Use async/await; handle errors explicitly.
- Immutability: Use `const`/`readonly` where possible.
- Validation: Zod for I/O boundaries; infer types from schemas.

Examples

```ts
// Imports and type-only usage
import { hash } from "bcrypt";
import type { User } from "./models";

// Zod schema and inferred type
import { z } from "zod";
export const UserIn = z.object({
  id: z.uuid(),
  email: z.email(),
});
export type UserIn = z.infer<typeof UserIn>;

// Fire-and-forget
void someAsyncSideEffect();

// Casting env
const apiUrl = import.meta.env.PUBLIC_API_URL as string;
```

Tooling

- ESLint (typescript-eslint, import-x, promise, security), Prettier, sort-imports.
- Tests: `.test.ts`/`.spec.ts` with Vitest.
