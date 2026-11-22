---
description: Append a lesson learned to the right INSIGHTS.md
argument-hint: <what happened → rule/fix>
---
Record this insight: $ARGUMENTS

1. Pick the file by where the lesson applies: `server/`, `client/`, `reviewer-core/` or `e2e/` → that
   package's `INSIGHTS.md`; spans several packages → root `INSIGHTS.md`. If neither the text nor this
   conversation makes it clear, ask.
2. Append ONE line at the bottom: `- YYYY-MM-DD · <area> · <what happened> → <rule/fix>`
   (today's date; area = module or folder, e.g. `repo-intel`, `migrations`, `sse`).
3. Keep it concrete and to one line. Never include secrets, tokens or personal data.
4. If the same lesson is already recorded, don't duplicate it — point to the existing line and suggest
   promoting it into that package's CLAUDE.md Gotchas.

Do not edit any CLAUDE.md.
