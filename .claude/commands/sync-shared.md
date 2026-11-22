---
description: Sync @devdigest/shared from server to the client copy and typecheck every consumer
---
Source of truth: `server/src/vendor/shared/`. Manual copy: `client/src/vendor/shared/`.
reviewer-core imports the server copy directly, so it never needs syncing.

1. Run `diff -ru server/src/vendor/shared client/src/vendor/shared` and summarise each difference.
2. Default plan: make the client copy an exact mirror of the server copy. If the client has something the
   server lacks, stop and ask — never copy client → server without confirmation.
3. Show the plan, then apply it to the client copy.
4. Typecheck all three consumers and report failures with their output:
   - `cd server && pnpm typecheck`
   - `cd client && pnpm typecheck`
   - `cd reviewer-core && npm run typecheck`
