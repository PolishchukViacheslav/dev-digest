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

- 2026-11-22 — Timeline rows (`RunSummary` from `/pulls/:id/runs`) only carry `findings_count`/`blockers`. Per-finding data for a run comes from `usePrReviews`, joined on `review.run_id` (`findingsByRun` in FindingsTab). Seeded reviews (demo PR #482) have `run_id: null`, so they never show up on the timeline → to demo or check timeline finding UI, use a PR with a real agent run, not the seed (client/src/app/repos/[repoId]/pulls/[number]/_components/FindingsTab/FindingsTab.tsx:76)
- 2026-11-22 — UI the homework or mockups call "already in the app" (PR-list Findings column icons, `FindingsPopover` "N FINDINGS IN THIS RUN") is missing from this starter. It lives only in upstream lesson branches (e.g. `upstream/Lesson-06-lab-finish`, commit 01a30ce, attached to `PRRow`, not the timeline) → before building, run `git grep "<UI text>" $(git for-each-ref --format='%(refname:short)' refs/remotes/upstream) -- client/src` and port or adapt from there (client/src/app/repos/[repoId]/pulls/_components/PRRow/PRRow.tsx:14)
- 2026-11-22 — the PR-list FINDINGS column now exists and supersedes the "missing from this starter" entry above. Counts come from `GET /repos/:id/pulls` (`findings_critical/warning/suggestion`): the latest review, every finding including dismissed ones, so they add up to the score ring (100 − 35·C − 12·W − 3·S). `null` means never reviewed. Upstream's hover popover (01a30ce) was NOT ported → to add it, lazy-load `usePrReviews` on hover and render through a portal: the table card clips with `overflow:hidden` (client/src/app/repos/[repoId]/pulls/_components/PRFindings/PRFindings.tsx:14, server/src/modules/pulls/routes.ts:114)
- 2026-11-22 — the PR-list findings popover now exists, which supersedes the "popover NOT ported" part of the entry above. Both the timeline and the PR list render the shared `FindingsPopoverCard`. The list version is hover-only by the user's choice (not click), opens after a 150 ms hover-intent delay so sweeping down the column doesn't fetch every row, is portalled to `<body>`, and stops click propagation on the portal wrapper (React events bubble through portals to `PRRow`, which navigates) → change popover visuals in the card only, and keep that `stopPropagation` (client/src/app/repos/[repoId]/pulls/[number]/_components/FindingsPopoverCard/FindingsPopoverCard.tsx:15, client/src/app/repos/[repoId]/pulls/_components/PRFindings/PRFindings.tsx:154)

## Tool & Library Notes
<!-- Dependency/tool/env quirks and measured facts (timings, limits, sizes) -->

- 2026-11-22 — run-drawer `formatTokens` used `(n/1000).toFixed(0)k`, so runs under 500 tokens rendered as `0k` → use `formatTokens` in `src/lib/format.ts` (keeps counts under 1000 exact, returns "—" for missing values) (client/src/lib/format.ts:29)
- 2026-11-22 — Playwright isn't installed outside the e2e package, but local Chrome can screenshot the live UI with client-fetched data already rendered: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1500,700 --virtual-time-budget=15000 --screenshot=<scratchpad>/out.png <url>` (the `task_policy_set` errors on stderr are harmless) → use it to check UI changes visually before reporting (verified on /repos/:id/pulls)
- 2026-11-22 — `chrome --headless --screenshot` can't hover. For hover UI, start Chrome with `--headless=new --remote-debugging-port=9333 --user-data-dir=<scratchpad>/profile`, then a ~40-line Node 22 script (built-in `WebSocket`, no deps): `/json/list` → `Page.navigate` → poll `Runtime.evaluate` for the element's rect → `Input.dispatchMouseEvent {type:'mouseMoved'}` → wait 2 s → `Page.captureScreenshot`. Verified on the PR-list and timeline popovers; `pkill -f remote-debugging-port=9333` afterwards

## Recurring Errors & Fixes
<!-- Exact error → root cause → fix -->

- 2026-11-22 — a value import from `@devdigest/shared` (e.g. `import { Severity }` to read `Severity.options`) makes `next dev` return 500 on EVERY page with `Module not found: Can't resolve './contracts/findings.js'`, while `pnpm test` and `pnpm typecheck` stay green (Vite and tsc map `.js`→`.ts`, Next's webpack doesn't). The client has always used `import type` only → keep shared imports type-only; for runtime values use a local literal checked with `satisfies readonly Severity[]`, and after changing imports run `curl -s -o /dev/null -w '%{http_code}' localhost:3000/` (client/src/vendor/shared/index.ts:17, FindingsPanel/constants.ts:1)
- 2026-11-22 — React warns "Updating a style property during rerender (borderColor) when a conflicting property is set (borderLeftColor)" whenever a `FindingCard`'s `focused` flips on re-render (e.g. in tests that filter the list): the existing card style mixes the `borderColor` shorthand with `borderLeftColor`. The warning comes from older code, not from the new test → if you touch FindingCard, split it into `borderTopColor`/`borderRightColor`/`borderBottomColor` (client/src/app/repos/[repoId]/pulls/[number]/_components/FindingCard/styles.ts:10)

## Session Notes
<!-- One line per session that added entries: date — task — entries -->

- 2026-11-22 — run cost badge (M1) — 1 entry
- 2026-11-22 — severity counters + filter in a review run (L01 homework) — 2 entries
- 2026-11-22 — timeline severity icons + findings popover — 2 entries
- 2026-11-22 — PR-list FINDINGS column (server rollup + client cell) — 2 entries
- 2026-11-22 — PR-list findings hover popover (shared card with the timeline) — 2 entries

## Open Questions
<!-- Unresolved findings; answer later with a new dated entry that references the question -->
