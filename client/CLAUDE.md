# client — @devdigest/web (Next.js 15 App Router, React 19)

## Commands (pnpm)
- `pnpm dev` (:3000, needs the API on :3001) · `pnpm typecheck` · `pnpm build`
- `pnpm test` — vitest + jsdom, fetch mocked (no API needed)

## Where things are
- `src/app/**/page.tsx` thin pages; feature logic in colocated `_components/<Name>/`
- `src/lib/hooks/*` all data access (TanStack Query) → `src/lib/api.ts`; SSE run stream in `lib/hooks/reviews.ts`
- `src/vendor/ui` = `@devdigest/ui` primitives · `messages/en/<namespace>.json` UI strings

## Conventions (non-default)
- Component folder: `Name.tsx` · `index.ts` · `constants.ts` · `helpers.ts` · `styles.ts` · `Name.test.tsx`
- Styles = `CSSProperties` objects in `styles.ts` using CSS vars (`var(--border)`). Tailwind 4 is installed,
  but app code barely uses utility classes — follow the styles.ts pattern.
- Components never fetch; data always goes through a hook in `lib/hooks`.
- UI text only via `useTranslations` + `messages/en/*.json`.
- Reuse `@devdigest/ui` primitives before writing new ones.

## Gotchas
- `src/vendor/shared` is a manual copy of `server/src/vendor/shared` and has drifted (e.g. no `openrouter`
  in `LLMProvider.id`). Edit the server copy first, then mirror here.
- PR detail route is `/repos/[repoId]/pulls/[number]`.
- `vendor/ui` and `messages/en/` hold future-milestone pieces (blast, brief, ci, eval…) — not dead code.

## Docs — on demand
- Route ↔ API endpoint map → `README.md` · UI kit → `src/vendor/ui/README.md`
- Design docs → `docs/` · Specs → `specs/` · Lessons → `INSIGHTS.md`
