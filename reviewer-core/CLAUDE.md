# reviewer-core — pure review engine

diff + prompts → LLM → structured Review → grounding gate. The server imports this package as TS source.

## Commands (npm, NOT pnpm)
- `npm ci` — also required for the server to run/typecheck (zod is aliased to this package's node_modules)
- `npm test` · `npm run typecheck` (= build; the package never emits JS)

## Where things are
- `src/index.ts` — the ONLY surface the server may import
- `src/review/run.ts` orchestration · `src/prompt.ts` assembly + injection guard · `src/grounding.ts` citation gate
- `src/llm/` OpenRouter provider + structured output · `src/output/to-review.ts` GitHub payload (used from M6)

## Invariants — do not break
- Purity: no DB, fs, network, `process.env`. The only side effect is the injected `LLMProvider`.
- Imports from outside the package: only `@devdigest/shared`.
- Grounding is mandatory: findings that don't hit a diff line are dropped.
- Score is recomputed from kept findings; never take the model's score.
- Injection defense = `INJECTION_GUARD` + `wrapUntrusted`. No keyword/denylist scanning (deliberate decision).

## Gotchas
- Changing `index.ts` exports or `ReviewInput` breaks the server → also run `cd ../server && pnpm typecheck`.
- Prompt slots `skills` / `memory` / `specs`, `reduce()`, `toReview()` are milestone hooks, not dead code.
- Comments mention `agent-runner` (CI runner) — it doesn't exist in this repo until M6.

## Docs — on demand
- Pipeline diagram, public API → `README.md`
- How prompts reach the model, prompt conventions → `../docs/agent-prompts/README.md`
- Design docs → `docs/` · Specs → `specs/` · Lessons → `INSIGHTS.md`
