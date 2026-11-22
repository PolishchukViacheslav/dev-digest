---
description: Create a feature spec from the template in the right specs/ folder
argument-hint: <feature name> [milestone, e.g. M1]
---
Create a spec for: $ARGUMENTS

1. Location: the feature touches ≥2 packages → root `specs/`; otherwise `<package>/specs/`.
   e2e has no separate specs folder (its `specs/` holds flows). State the choice and why.
2. File name: `<milestone>-<kebab-slug>.md` (e.g. `M1-cost-badge.md`), or `<kebab-slug>.md` without a milestone.
3. Copy `specs/_template.md` and fill in what the request and the README roadmap make known.
   Mark unknowns as `TODO(question)` instead of inventing them.
4. Read the relevant code before filling "Affected areas" — cite real paths only.
