# Insights — server

Append-only knowledge from past sessions, written by the `engineering-insights` skill. Read before working here.
Entry: `- YYYY-MM-DD — <finding> → <what to do> (path/to/file.ts:LINE)`
Humans prune monthly: drop stale entries, promote repeated ones into CLAUDE.md Gotchas.

## What Works
<!-- Approaches and solutions proven to work in this module -->

## What Doesn't Work
<!-- Dead ends and antipatterns: what was tried, why it failed, what to do instead (highest value) -->

## Codebase Patterns
<!-- Non-obvious conventions, hidden dependencies between files, architecture decisions and their reason -->

- 2026-11-22 — seed demo `agent_runs` sit inside the `if (!pr)` block, so DBs seeded before this change never get them; only a fresh seed shows runs → add demo rows via a one-off script, do NOT `docker compose down -v` to re-seed (server/src/db/seed.ts:99)
- 2026-11-22 — reviewer-core returns `costUsd = null` if ANY chunk lacks a price (no partial sums) → treat null as "unknown" (shows "—"), never coerce to 0 or sum around it (reviewer-core/src/review/run.ts:184)
- 2026-11-22 — `agent_runs.cost_usd` existed in `0000_init`, was dropped in `0009_complex_runaways` and re-added as `0010`; do not assume historic columns still exist → check the latest migration/schema before reading a column (server/src/db/migrations/0009_complex_runaways.sql:1)

## Tool & Library Notes
<!-- Dependency/tool/env quirks and measured facts (timings, limits, sizes) -->

## Recurring Errors & Fixes
<!-- Exact error → root cause → fix -->

## Session Notes
<!-- One line per session that added entries: date — task — entries -->

- 2026-11-22 — run cost badge (M1) — 3 entries

## Open Questions
<!-- Unresolved findings; answer later with a new dated entry that references the question -->
