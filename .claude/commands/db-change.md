---
description: Make a DB schema change the safe way (Drizzle)
argument-hint: <what to change>
---
Schema change: $ARGUMENTS

Work in `server/`.

1. Edit the table definitions in `src/db/schema/*.ts` (re-exported by `src/db/schema.ts`).
   Never edit existing files in `src/db/migrations/` or `src/db/migrations/meta/`.
2. `pnpm db:generate`, then open the new SQL file and review it with me. Destructive operations
   (DROP, column type changes, NOT NULL without a default) need my explicit OK before going further.
3. `pnpm db:migrate` against the local DB (Docker must be running).
4. If seed data depends on the change, update `src/db/seed.ts` and keep it idempotent.
5. Run `pnpm typecheck` and `pnpm exec vitest run .it.test` (needs Docker); report the results.
