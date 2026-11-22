# e2e — deterministic browser flows (agent-browser)

## Commands (npm)
- Once: `npm install` and `npm i -g agent-browser && agent-browser install`
- Default — hermetic (own Postgres, alternate ports, never touches the dev DB): `npm run e2e:hermetic`
- Against an already-running freshly-seeded stack: `npm test` (`E2E_BASE_URL`, default http://localhost:3000)

## How it works
- A flow = `specs/NN-name.flow.json`, a list of agent-browser commands run in order by `run.ts`.
  Here `specs/` IS the executable spec — there is no separate specs folder.
- `wait --text` / `wait --url` are the assertions (non-zero exit fails the step).

## Rules
- Deterministic locators only (`--url`, `--text`, `find role|text|label`). Never `chat`, never anything that calls an LLM.
- Read-only seeded data (`acme/payments-api`, PR #482, built-in agents); don't create or mutate data.
- `npm test` against the dev DB fails flows 02/04/05 (they assume the seeded repo is the only one) — use hermetic.
- Changing seed data or UI copy breaks `wait --text` → update the flows in the same change.

## Docs — on demand
- Flow format, runner options → `README.md` · Design notes → `docs/` · Lessons → `INSIGHTS.md`
