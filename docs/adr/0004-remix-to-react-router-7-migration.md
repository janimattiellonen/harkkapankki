# 0004. Migrate from Remix v2 to React Router 7

- **Status:** Accepted
- **Date:** 2026-04-01 (decision made), retroactively documented 2026-05-07
- **Deciders:** janimattiellonen
- **Related:** PR #27 (migration), PR #28 (React 19 follow-up), spec at `docs/17 - upgrade to react router 7.md`

## Context

The project was built on Remix v2.16.6. In late 2024 / early 2025 the
Remix team announced that Remix as a separate framework was being folded
into React Router 7 — same loaders/actions/route conventions, same SSR
model, but published under the `react-router` and `@react-router/*`
packages. Remix v2 became, in effect, a frozen branch.

The choice was: stay on a maintenance-mode framework, or migrate while
the codebase was still small enough to do it cheaply.

Constraints:

- The app already had ~10 routes with loaders, actions, file uploads,
  i18n integration (see ADR-0003), and form handling via
  `react-hook-form`.
- `remix-i18next` had a v6→v7 release that aligned with RR7 and kept the
  class-based API the project already used.
- The custom file-upload helper (`app/utils/upload.server.ts`) used
  Remix's `unstable_*` upload handlers. RR7 removed those in favour of
  standard Web APIs — so the upload code had to be rewritten regardless.

## Decision

Migrate the entire codebase to React Router 7 in a single PR (#27).
Specifically:

- Replace every `@remix-run/*` package with the `react-router` /
  `@react-router/*` equivalents.
- Swap the Remix Vite plugin for `reactRouter()` from
  `@react-router/dev/vite`.
- Add `react-router.config.ts` and `app/routes.ts` (RR7's explicit route
  config — replaces filesystem-only convention).
- Replace `json()` helper calls with plain returns; use `data()` only
  where a non-200 status is needed.
- Rewrite `app/utils/upload.server.ts` against standard `Request` /
  `FormData` Web APIs instead of the removed Remix `unstable_*` upload
  utilities.
- Switch entry files: `RemixServer` → `ServerRouter`, `RemixBrowser` →
  `HydratedRouter`.
- Update `Date` typings: RR7's single-fetch preserves `Date` objects
  through the loader boundary, so types like `scheduledAt: string` were
  corrected to `Date`.
- Bump `remix-i18next` from v6 → v7 (still supports the class-based API
  used in `app/i18n.server.ts`).
- Remove the now-stale "Architecture" and "Routes" sections from
  `CLAUDE.md` — the conventions they described (`*.server.ts` files,
  page-component split) survived the migration unchanged but were
  documented in the wrong place.

The migration was followed shortly by PR #28 (React 18 → 19), which
RR7's peer dependencies allowed but didn't strictly require. That bump
is intentionally **not** a separate ADR — RR7 was the forcing function
and the React bump was a low-risk follow-on.

## Alternatives considered

- **Stay on Remix v2 indefinitely.** Rejected: Remix v2 receives only
  critical fixes going forward; the ecosystem is moving to RR7. Every
  month of delay grows the migration diff (more routes, more loaders,
  more tests).
- **Rewrite as a Next.js app.** Rejected: would discard the entire
  loader/action model the codebase is built around. Migration cost would
  be 10× the RR7 path, with no proportional benefit for an app this
  size.
- **Stay on Remix and adopt React Router for client-side routing only
  (the v6 use-case).** Rejected: doesn't solve the maintenance question
  — Remix is still the framework. Adds a second router for no gain.
- **Migrate route by route on a long-lived branch.** Rejected: RR7 and
  Remix v2 share enough surface that an incremental migration is
  technically possible but practically painful — `package.json` can't
  hold both `@remix-run/*` and `@react-router/*` cleanly. The codebase
  was small enough (~10 routes, ~30 files touched) that a single PR was
  faster.

## Consequences

### Positive

- The framework is now on the supported, actively-developed track.
- File-upload code is now standard Web API — portable, easier to test,
  no `unstable_` prefix.
- `react-router.config.ts` + `app/routes.ts` make the route map explicit
  rather than purely filesystem-derived; new routes are registered in
  one place.
- Single-fetch preserves `Date` objects through loaders — removed several
  defensive `new Date(stringValue)` calls at component boundaries.
- The migration unlocked the React 19 upgrade (PR #28), which the React
  Router 7 peer deps support natively.

### Negative / costs

- One large diff across 30+ files. Reviewable, but not a
  cherry-pickable change. The PR is now the canonical reference for
  "what changed in the migration".
- `remix-i18next` is still the i18n adapter (v7). It tracks RR7 well
  today, but a future RR7 major could put pressure on this dependency.
  See ADR-0003's "neutral / follow-ups" note about framework coupling.
- The `unstable_*` upload API rewrite is a behaviour-equivalent
  reimplementation, not a verified-against-edge-cases one. Test coverage
  on uploads is light; if regressions surface, expect them here.
- All tooling integrations (typecheck script now runs
  `react-router typegen && tsc`, dev/build/start scripts changed) had to
  be updated. New contributors need to know `react-router dev`, not
  `remix vite:dev`.

### Neutral / follow-ups

- React 18 → 19 followed in PR #28. The bump was unremarkable and is
  not given its own ADR — flagged here for completeness.
- The deleted CLAUDE.md sections ("Architecture", "Routes") described
  conventions that still apply. They were removed because they assumed
  Remix-specific framing; the underlying rules survive in the codebase.
- If RR7 ships a breaking change in a future major, a follow-up ADR
  should describe the upgrade path rather than amending this one.

## References

- Spec: `docs/17 - upgrade to react router 7.md`
- Migration PR: [#27 remix-to-rr7](https://github.com/janimattiellonen/Harkkapankki/pull/27), commit `9ec3579`
- React 19 follow-up: PR [#28 dependeny-upgrades](https://github.com/janimattiellonen/Harkkapankki/pull/28), commit `895dda7`
- Upstream guide: https://reactrouter.com/upgrading/remix
- Code: `react-router.config.ts`, `app/routes.ts`, `app/entry.{client,server}.tsx`, `app/utils/upload.server.ts`, `package.json`
