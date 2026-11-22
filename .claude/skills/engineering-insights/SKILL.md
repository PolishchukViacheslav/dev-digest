---
name: engineering-insights
description: Appends substantial, non-obvious engineering findings from the current session to the INSIGHTS.md of the module that was worked on (the nearest INSIGHTS.md above the files involved — repo-intel, server, client, reviewer-core, e2e, or the repo root for cross-package findings). Use at the end of every coding task; right after fixing a bug or a failing build or test; when an approach turns out to be a dead end; when a fact is measured; when a library, tool or the codebase behaves unexpectedly; when the user corrects the agent; or when the user says "wrap up", "save insights" or "remember this".
---

1. Read the target `INSIGHTS.md` in full first — the nearest one above the files the finding is about (several packages → repo root).
2. Collect candidates from this session: user corrections, fixes with root cause, dead ends, measured facts, hidden dependencies, surprising behavior.
3. Keep only substantial ones: not obvious from reading the code or docs, would save 5+ minutes or prevent a wrong change next time, actionable cold from the line alone. Skip one-offs, renames, style, chat replay.
   ✗ "Be careful with env files"  ✓ "dotenv loads only `server/.env`; `.env.local` is silently ignored → put keys in `.env` (server/src/platform/config.ts:1)"
4. Drop anything the file already says, even in other words. Nothing left → write nothing and reply "No new insights".
5. Append each survivor (max 5) at the end of its section: `- YYYY-MM-DD — <finding> → <what to do> (path:line)`; evidence is `path:line`, or the command/output that proves it.
6. Only if you added entries, append one Session Notes line: `- YYYY-MM-DD — <task> — <n> entries`.
7. Append-only: never edit, reorder or delete lines; to correct one, append a new dated entry naming what it supersedes. Never record secrets or personal data.
8. Finish with one line: what was added (or skipped as already known) and where.
