# Insights — client

Append-only knowledge from past sessions, written by the `engineering-insights` skill. Read before working here.
Entry: `- YYYY-MM-DD — <finding> → <what to do> (path/to/file.ts:LINE)`
Humans prune monthly: drop stale entries, promote repeated ones into CLAUDE.md Gotchas.

## What Works
<!-- Approaches and solutions proven to work in this module -->

## What Doesn't Work
<!-- Dead ends and antipatterns: what was tried, why it failed, what to do instead (highest value) -->

## Codebase Patterns
<!-- Non-obvious conventions, hidden dependencies between files, architecture decisions and their reason -->

## Tool & Library Notes
<!-- Dependency/tool/env quirks and measured facts (timings, limits, sizes) -->

- 2026-11-22 — run-drawer `formatTokens` used `(n/1000).toFixed(0)k`, so runs under 500 tokens rendered as `0k` → use `formatTokens` in `src/lib/format.ts` (keeps counts under 1000 exact, returns "—" for missing values) (client/src/lib/format.ts:29)

## Recurring Errors & Fixes
<!-- Exact error → root cause → fix -->

## Session Notes
<!-- One line per session that added entries: date — task — entries -->

- 2026-11-22 — run cost badge (M1) — 1 entry

## Open Questions
<!-- Unresolved findings; answer later with a new dated entry that references the question -->
