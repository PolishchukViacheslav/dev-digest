# server — @devdigest/api (Fastify 5 + Drizzle)

## Commands (pnpm)
- `pnpm dev` (:3001) · `pnpm typecheck`
- Unit, no Docker: `pnpm exec vitest run --exclude '**/*.it.test.ts'`
- Integration, needs Docker: `pnpm exec vitest run .it.test`
- Schema change: edit `src/db/schema/*` → `pnpm db:generate` → review the SQL → `pnpm db:migrate`
- `pnpm db:seed` — idempotent

## Where things are
- `src/app.ts` bootstrap · `src/platform/` container (DI), jobs, sse (RunBus), config, errors
- `src/modules/<name>/` routes → service → repository; registry `src/modules/index.ts`
- `src/adapters/` port implementations; test doubles in `src/adapters/mocks.ts`
- `src/vendor/shared/` = `@devdigest/shared`, contracts for ALL packages

## Conventions (non-default)
- New module: `modules/<name>/routes.ts` (default plugin) + one line in `modules/index.ts`.
  Static registry — `@fastify/autoload` is in deps but deliberately unused.
- Validation: Zod via `app.withTypeProvider<ZodTypeProvider>()` + `schema: { params, body }`; no manual `.parse(req.body)`.
- Tenancy: `getContext(container, req)` → scope every query by `workspaceId`.
- External deps only through `Container`. New adapter = interface in `vendor/shared/adapters.ts`
  + `ContainerOverrides` entry + mock in `adapters/mocks.ts`.
- Secrets only via `container.secrets`; never `process.env`, never in AppConfig.
- Errors: throw `AppError` / `NotFoundError` from `platform/errors.ts`.
- Background job: `container.jobs.register(KIND, …)` in the service constructor.
- A test importing `test/helpers/pg.ts` MUST be named `*.it.test.ts`.

## Gotchas
- dotenv reads only `server/.env`; `.env.local` is ignored.
- Migrations don't run on boot. Seed is REQUIRED: the no-auth provider needs user `you@local` + workspace `default`.
- reviewer-core source needs its own deps: run `npm ci` in `../reviewer-core` or dev/typecheck fails.
- Two zod instances (server vs reviewer-core) → `instanceof ZodError` is unreliable; match by shape.
- Reviews run fire-and-forget outside JobRunner; RunBus is in-memory → single API instance only.
- `GET /repos/:id/pulls` and `GET /pulls/:id` sync from GitHub and write to the DB.
- Seeded agents use provider `openrouter` → reviews need `OPENROUTER_API_KEY`.

## Do not touch
- Applied `src/db/migrations/*` and `meta/` — new migrations only via `pnpm db:generate`
- `src/vendor/shared/` without mirroring to `client/src/vendor/shared/` + reviewer-core typecheck
- `docker-compose.yml` in this folder (leftover; the root one is used)

## Docs — on demand
- API map, request/DI flow, env vars → `README.md`
- repo-intel pipeline + facade → `src/modules/repo-intel/README.md` · its lessons → `src/modules/repo-intel/INSIGHTS.md`
- Test split → `../TESTING.md`
- Design docs → `docs/` · Specs → `specs/` · Lessons → `INSIGHTS.md`
