# Insights — cross-package

Append-only knowledge from past sessions, written by the `engineering-insights` skill. Read before working here.
Entry: `- YYYY-MM-DD — <finding> → <what to do> (path/to/file.ts:LINE)`
Humans prune monthly: drop stale entries, promote repeated ones into CLAUDE.md Gotchas.

## What Works
<!-- Approaches and solutions proven to work in this module -->

## What Doesn't Work
<!-- Dead ends and antipatterns: what was tried, why it failed, what to do instead (highest value) -->

## Codebase Patterns
<!-- Non-obvious conventions, hidden dependencies between files, architecture decisions and their reason -->
- 2026-11-22 — the PR body goes into the reviewer prompt as context (up to 4000 chars) → a reviewer-fixture PR with planted bugs must have a neutral feature description; never name the planted defects in it, and keep the answer key outside the repo (reviewer-core/src/prompt.ts:99)

## Tool & Library Notes
<!-- Dependency/tool/env quirks and measured facts (timings, limits, sizes) -->
- 2026-11-22 — a fresh `git worktree` typechecks without reinstalling if you symlink `server/`, `client/` and `reviewer-core/node_modules` from the main checkout. The `node_modules/` ignore pattern only matches directories, so the symlinks show up as untracked → stage explicit paths in a worktree, never `git add .` (.gitignore:1)

## Recurring Errors & Fixes
<!-- Exact error → root cause → fix -->

## Session Notes
<!-- One line per session that added entries: date — task — entries -->
- 2026-11-22 — severity-testing reviewer fixture PR — 2 entries

## Open Questions
<!-- Unresolved findings; answer later with a new dated entry that references the question -->
