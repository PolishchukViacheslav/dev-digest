# DevDigest

Local-first AI pull-request reviewer. Starter template: one flow end to end (import PR → agent review);
roadmap milestones M1–M8 add features back.

## Stack
Node ≥22 · TypeScript 5.9 strict · Fastify 5 · Drizzle 0.45 + Postgres 16/pgvector (Docker) · Zod 3 ·
Next.js 15 + React 19 · TanStack Query 5 · Vitest 2

## Map — before editing inside a package, read its CLAUDE.md
| Path | What | PM |
|---|---|---|
| `server/` | Fastify API :3001, DB, jobs, repo-intel → `server/CLAUDE.md` | pnpm |
| `client/` | Next.js studio :3000 → `client/CLAUDE.md` | pnpm |
| `reviewer-core/` | pure engine: diff → prompt → LLM → grounding → `reviewer-core/CLAUDE.md` | npm |
| `e2e/` | deterministic browser flows, no LLM → `e2e/CLAUDE.md` | npm |
| `scripts/` | `dev.sh` full local boot · `e2e.sh` hermetic e2e | — |

## Commands
- Full local boot: `./scripts/dev.sh` (Docker must be running; flags `--db-only`, `--no-client`)
- Per-package test / typecheck: see the package CLAUDE.md

## Cross-package gotchas
- NOT a workspace: no root package.json — install and run commands inside each package.
- `@devdigest/shared` (Zod contracts + adapter interfaces) source of truth = `server/src/vendor/shared`.
  reviewer-core imports it via `../server/…`; `client/src/vendor/shared` is a MANUAL copy (already drifted).
  Contract change → mirror to the client copy + typecheck server, client and reviewer-core.
- reviewer-core is consumed as TS source through tsconfig path aliases; there is no build/publish step.
- Use the ROOT `docker-compose.yml`. `server/docker-compose.yml` is an unreferenced leftover.
- Tables, contracts and UI pieces for future milestones exist but are unused — not dead code, don't delete.

## Do not touch
- Applied migrations in `server/src/db/migrations/`
- `docker compose down -v` — deletes the dev DB volume with every imported repo and review
- Vendored skills in `.claude/skills/` (pinned by `skills-lock.json`; `engineering-insights` is ours) · lockfiles by hand

## Docs — read only when the task needs it
- Product overview, roadmap, architecture diagram → `README.md`
- Test strategy, CI matrix → `TESTING.md`
- Reviewer agent prompts and how prompts are assembled → `docs/agent-prompts/`
- Cross-package design docs / ADRs → `docs/`
- Specs for features spanning ≥2 packages → `specs/` (template `specs/_template.md`)
- Cross-package lessons learned → `INSIGHTS.md`

## Insights loop (mandatory)
- Start: when a request concerns code, read the `INSIGHTS.md` nearest to the files involved
  (`server/src/modules/repo-intel/`, `server/`, `client/`, `reviewer-core/`, `e2e/`; root for cross-package)
  before planning or editing. Treat entries as high-confidence guidance unless the code or the user says otherwise.
  Open your first reply on the task with one line: `Insights read: <module> — <entries that apply | none relevant>`.
- End: after every coding task, run the `engineering-insights` skill. It re-reads the file and appends only
  substantial new findings — often nothing.
