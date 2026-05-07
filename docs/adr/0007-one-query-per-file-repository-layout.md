# 0007. One query per file with `query` prefix in `app/repositories/`

- **Status:** Accepted
- **Date:** 2026-05-05
- **Deciders:** janimattiellonen
- **Related:** PR #42, commit `44212fc`

## Context

By the time the season planning feature shipped (ADR-0006), the
repository layer had grown to 5 monolithic files:

```
app/repositories/
  exercise.server.ts          (~84 lines, multiple find/create/update)
  practiceSession.server.ts   (~238 lines, ~10 query functions)
  season.server.ts            (~146 lines)
  exerciseType.server.ts
  section.server.ts
```

Each file held a mixed bag of read and write functions for one
domain entity. Three problems started showing up:

1. **PR diffs were noisy.** Adding a new query meant editing a 200+
   line file; reviewers had to scan the whole file to confirm nothing
   else changed.
2. **Grep returned too much context.** Searching for "where do we load a
   practice session by slug" returned the whole repo file rather than
   a single result.
3. **Imports were ambiguous.** A page importing
   `findPracticeSession` from `practiceSession.server.ts` could be
   pulling any of half a dozen variants — by ID, by slug, with or
   without sections, with or without coverage data. The function name
   carried the meaning, but the import line gave no hint about which
   query was being used until you looked inside.

The team uses Claude Code heavily for changes; AI agents working with
narrow context windows benefit from files-as-units-of-meaning more
than humans do.

## Decision

Split the repository layer so that **each query function lives in its
own file**, named `query<DescriptiveName>.server.ts`, exporting a
single function with a matching `query`-prefixed name.

5 monolithic files → 25+ single-purpose files. Examples:

```
app/repositories/queryExerciseBySlug.server.ts            // export queryExerciseBySlug
app/repositories/queryCreateExercise.server.ts            // export queryCreateExercise
app/repositories/queryUpdateExercise.server.ts            // export queryUpdateExercise
app/repositories/queryDeleteExercise.server.ts            // export queryDeleteExercise
app/repositories/queryPracticeSessionsBySlugPrefix.server.ts
app/repositories/querySeasonBySlugWithCoverage.server.ts
app/repositories/queryCreatePracticeSessionTx.server.ts   // transactional variant
```

Naming rules:

- **Read queries** drop any `find*` verb and start directly with
  `query` + entity + qualifier:
  `findExerciseBySlug` → `queryExerciseBySlug`.
- **Write queries** keep the operation verb after `query`:
  `createExercise` → `queryCreateExercise`,
  `updateSeason` → `queryUpdateSeason`,
  `deleteExercise` → `queryDeleteExercise`.
- **Transactional variants** suffix with `Tx`:
  `queryCreatePracticeSessionTx`.
- **Specialised reads** include the qualifier in the filename:
  `queryPracticeSessionsBySlugPrefix`,
  `querySeasonBySlugWithCoverage`,
  `queryRootExerciseTypesWithChildren`.

Files are flat under `app/repositories/` — no per-entity subdirectories.

## Alternatives considered

- **Keep 5 monolithic per-entity files.** Rejected: see context.
  Workable, but every problem above gets worse as the app grows.
- **Per-entity subdirectories** (`app/repositories/exercise/queryBySlug.ts`).
  Rejected: extra path depth without payoff. The flat structure with
  entity-prefixed filenames keeps `ls` and grep useful, and there's
  no naming collision risk.
- **Drop the `query` prefix; use entity + verb only**
  (`exerciseBySlug.server.ts`). Rejected: the prefix makes it obvious
  at a glance whether an import is a DB query vs. a service or
  utility — useful both for humans scanning a file's imports and for
  agent searches.
- **Class-based repositories** (`ExerciseRepository.findBySlug()`).
  Rejected: tree-shaking is worse, the codebase otherwise prefers
  plain functions, and class methods don't compose with React Router 7
  loaders any better than functions do.
- **Inline queries directly in service files.** Rejected: services
  ought to be testable in isolation from Prisma. Keeping the data
  layer addressable behind named functions preserves that boundary
  even when there's only one caller.

## Consequences

### Positive

- **Diff scope is now exactly the change.** Adding a query is a new
  file; modifying one touches only that file. Reviewers can read the
  whole change in one screen.
- **`grep "queryExerciseBySlug"` returns the definition and the
  callers — full stop.** No hits on adjacent functions.
- **Import lines self-document.** A page that imports
  `querySeasonBySlugWithCoverage` is unambiguously loading the
  coverage-augmented shape; no need to inspect the implementation.
- **Agents work with smaller context windows.** Loading a 7-line query
  file is cheaper than loading a 238-line repo file just to read one
  function.
- The convention is now codified — see decision rules above. New
  queries go through the same shape automatically.

### Negative / costs

- **The `app/repositories/` directory has 25+ files.** Visual noise in
  the directory listing. Mitigated by consistent prefixing —
  `queryExercise*`, `queryPracticeSession*`, `querySeason*` cluster
  alphabetically.
- **Cross-cutting changes touch more files.** A schema-wide rename
  ripples through every query file that references the renamed
  field, vs. a single sweeping edit on one repo file before. In
  practice this is `sed`-able and TypeScript surfaces missed updates.
- **Slight import overhead.** Service files now import 5–8 query
  functions instead of importing one repository module and reaching
  into it.
- **Adoption is total — no hybrid state.** PR #42 migrated all
  repositories at once. New queries that don't follow the convention
  will stand out in review.

### Neutral / follow-ups

- If the count crosses ~50 files, revisit per-entity subdirectories.
  At 25 it is comfortably flat.
- If a class of read queries grows (e.g., 10+ `querySeason*` variants
  with shared inclusion logic), consider extracting shared
  `include` / `select` shapes into a single helper file rather than
  duplicating them across query files. Not done yet.
- The convention was added to the project's coding standards
  alongside this PR. Future ADRs that introduce new layers (e.g.,
  a `commands/` directory for write-side orchestration) should
  decide whether the same one-thing-per-file rule applies.

## References

- PR: [#42 refactor/repo-one-query-per-file](https://github.com/janimattiellonen/Harkkapankki/pull/42), commit `44212fc`
- Verification: 84/84 tests still passing post-refactor; tsc, eslint,
  prettier clean (recorded in commit message).
- Code: `app/repositories/query*.server.ts`
- Affected services: `app/services/{exercises,practiceSessions,seasons,exerciseTypes,sections}.server.ts`
