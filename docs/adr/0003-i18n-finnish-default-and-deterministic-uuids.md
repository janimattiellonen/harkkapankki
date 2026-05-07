# 0003. i18n with Finnish as default + deterministic exercise-type UUIDs

- **Status:** Accepted
- **Date:** 2025-10-09 (decisions made), retroactively documented 2026-05-07
- **Deciders:** janimattiellonen
- **Related:** PR #22 (locale env + deterministic UUIDs), PR #23 (full i18n), `docs/i18n-usage.md`

## Context

Harkkapankki's audience is Finnish-speaking junior frisbee golf coaches.
The eventual handover target is `junnufriba.fi`, which is Finnish-only.
However, the codebase had grown with hardcoded English copy throughout —
labels, validation messages, navigation — and a `locale: 'en'` parameter
threaded through every translation lookup.

At the same time, the seed script was generating fresh `crypto.randomUUID()`
values for each exercise type on every run. This meant:

- Any environment that re-seeded got a different set of IDs.
- Cross-environment data movement (dev → staging dump → local restore)
  silently broke foreign-key references.
- The crawler's `content.json` files (see ADR-0002) hard-code
  `exerciseTypeId` per imported page, but those IDs only matched the most
  recent seed run.

Two related decisions had to be made together:

1. How do we make Finnish the natural default while keeping English as a
   live alternative for development and future reach?
2. How do we make exercise-type IDs survive reseeds and environment
   moves?

## Decision

### i18n

- Adopt `remix-i18next` + `react-i18next` with two locales: `fi` and `en`.
- Translations live in `public/locales/fi.json` and `public/locales/en.json`,
  loaded **server-side and inlined into the initial HTML** (no client
  HTTP fetch for translation bundles).
- The default locale is read from `APP_LOCALE` env var, defaulting to
  `'fi'` (`app/utils/locale.server.ts`):
  ```ts
  export function getDefaultLocale(): string {
    return process.env.APP_LOCALE || 'fi';
  }
  ```
- Every server-side service that previously took a hardcoded
  `locale: 'en'` argument now calls `getDefaultLocale()`.
- A `LanguageSwitcher` component lets users override at runtime.

### Deterministic UUIDs

- Exercise-type IDs are generated as **UUID v5** from the type's slug
  (`prisma/seed.ts`):
  ```ts
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const hash = createHash('sha1')
    .update(namespace + slug)
    .digest('hex');
  // formatted as a v5 UUID
  ```
- This makes IDs a pure function of the slug — same slug, same UUID, every
  time, every machine.
- The crawler's `content.json` files can therefore reference exercise
  types by their canonical UUID without re-seed coupling.

## Alternatives considered

### For i18n

- **Stay English-only and rely on browser translation.** Rejected:
  unreliable for technical/sport-specific terminology, and incompatible
  with the junnufriba.fi handover.
- **Finnish-only, drop English entirely.** Rejected: English is useful
  for development discussions, screenshots in this repo's PRs, and
  potential future reach. The marginal cost of keeping `en.json` is small.
- **Client-side translation loading via HTTP fetch.** Rejected: adds a
  request to first paint, complicates SSR, and translation bundles for
  two locales are a few KB — inlining them is cheaper than the round trip.
- **`next-i18next` / a different library.** Rejected: this app uses
  React Router 7 (post-Remix migration, ADR-0004), and `remix-i18next`
  was the path of least resistance with native loader integration.
  `next-i18next` was never on the table since this isn't Next.js.

### For exercise-type IDs

- **Auto-increment integers.** Rejected: forces sequence coordination
  across environments; reseeds reset the sequence; no good for distributed
  references in seed files or external systems like the crawler.
- **Random UUID v4 with a stable lookup table** (`slug → uuid` map kept
  in version control). Rejected: extra layer that solves the same problem
  UUID v5 solves natively. Lookup tables drift from reality.
- **Slug as the primary key directly.** Rejected: exercise-type slugs
  may evolve (Finnish wording revisions); we want the slug to be the
  human-readable handle and the UUID to be the immutable reference.

## Consequences

### Positive

- All UI text is now translatable; new copy must go through translation
  files, which keeps the Finnish surface complete by default. The
  `docs/i18n-usage.md` guide codifies the conventions for future work.
- Inlined translations mean **no extra HTTP requests** for i18n bundles
  and SSR returns fully-translated HTML.
- Reseeds, dev databases, and staging dumps all share the same
  exercise-type UUIDs — `content.json` files in
  `docs/junnufriba-crawler/parsed-data/` are durable references rather
  than snapshot-bound IDs.
- Switching `APP_LOCALE` between `fi` and `en` is a single env-var change
  for ops or test environments.

### Negative / costs

- Every new component must remember to use `t('namespace.key')` instead
  of inline strings — a discipline cost. There's no static check that
  catches a bare-string regression today.
- Two translation files must be kept in sync. Missing keys in one file
  don't break the build; they fall back silently. This is on us to catch
  in review.
- The deterministic UUID scheme is **load-bearing on slug stability**.
  Renaming an exercise-type slug changes its UUID, breaking every row
  that references the old ID. This must be done as a deliberate migration,
  not a casual edit.
- `remix-i18next` is somewhat tied to the Remix/React Router ecosystem —
  a future framework swap would mean redoing the SSR integration, not
  just swapping libraries.

### Neutral / follow-ups

- A linter rule (or a custom ESLint plugin) that flags string literals
  in JSX would close the discipline gap on missing translations. Not done
  yet.
- The `'6ba7b810-9dad-11d1-80b4-00c04fd430c8'` namespace is the standard
  DNS namespace UUID. A project-specific namespace would be marginally
  more correct semantically but offers no practical benefit; not worth
  changing now.

## References

- Locale env + deterministic UUIDs: PR [#22 finnish-content-by-default](https://github.com/janimattiellonen/Harkkapankki/pull/22), commit `951ba7a`
- Full translation infrastructure: PR [#23 add-translation-support](https://github.com/janimattiellonen/Harkkapankki/pull/23), commit `ca88651`
- Usage guide: `docs/i18n-usage.md`
- Code: `app/utils/locale.server.ts`, `app/i18n.server.ts`, `app/i18nextOptions.ts`, `app/components/LanguageSwitcher.tsx`, `public/locales/{fi,en}.json`, `prisma/seed.ts`
