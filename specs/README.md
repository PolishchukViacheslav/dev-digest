# specs — cross-package

What we are **building**: one spec per feature, with acceptance criteria.

- Feature touches ≥2 packages → spec lives here. Otherwise → `<package>/specs/`.
- Name: `<milestone>-<kebab-slug>.md` (e.g. `M1-cost-badge.md`); no milestone → `<kebab-slug>.md`.
- Start from [`_template.md`](_template.md) (or run `/spec`). When shipped, set `Status: Done`;
  move lasting "how it works" knowledge into `docs/`.
