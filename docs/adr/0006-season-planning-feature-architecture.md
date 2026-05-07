# 0006. Season planning as a first-class entity with phased rollout

- **Status:** Accepted
- **Date:** 2026-04-04 (plan merged) → ongoing through Phase 3 (2026-05-06), retroactively documented 2026-05-07
- **Deciders:** janimattiellonen
- **Related:** PRs #33 (plan doc), #35 (schema), #37 (CRUD), #38 (add-sessions + auto-gen), #39 (standalone/season cleanup), #40 (coverage view), #41 (hints), spec at `docs/18 - season planning feature plan.md`

> **Read the spec for full detail.** This ADR captures the architectural
> rationale and rejected alternatives, not the schema or UX. The 225-line
> plan doc is canonical for "what was built."

## Context

Harkkapankki's actual product goal — beyond "store and pick exercises"
— is **planning a whole season** of weekly junior practice sessions
that progress logically. Up to this point the app modelled a
`PracticeSession` as a standalone, dateless object. Sessions had no
parent grouping, no schedule, and no notion of belonging together.

The author runs ~20–25 weekly sessions per season (April–October) on a
fixed weekday/time, with occasional gaps. Building a full season's worth
of sessions ad-hoc was the dominant manual workflow. The lack of
structure meant:

- No place to store season-level defaults (weekday, start time,
  duration).
- No batch creation — every session was created one-by-one.
- No way to see "what have I covered across the season" or "did I
  repeat the same drill three weeks running."
- Long-term ambition (progression-aware planning) had nowhere to
  attach.

The spec doc (`docs/18 - season planning feature plan.md`) is the result
of an extended design conversation. It settles 25 numbered decisions
covering schema, UX, and auto-generation algorithm. This ADR captures
the **architectural meta-decisions** behind that spec — the ones whose
reasoning is non-obvious from the schema alone.

## Decision

### 1. Season is a first-class entity, not a tag

Add a `Season` table with its own slug, name, description, date range,
and default weekday/start-time/duration. `PracticeSession` gains a
nullable `seasonId` FK and a nullable `scheduledAt` timestamp.

### 2. Existing standalone sessions are preserved, not migrated

All pre-existing rows get `seasonId = NULL` and `scheduledAt = NULL`.
They remain reachable via `/practise-sessions` (which is filtered to
standalone-only after PR D). No backfill, no compatibility shim.

### 3. Season defaults are copy-on-create, not propagated

When a session is added to a season, the season's `defaultDayOfWeek`,
`defaultStartTime`, and `defaultDurationMin` are read **at creation
time** to seed the session's fields. Editing the season later does
**not** update existing sessions. This is the non-obvious one — coaches
might expect changes to propagate. We chose not to: a session has a
fixed real-world date, and retroactive edits to defaults would silently
shift past sessions' metadata.

### 4. Time is UTC `timestamptz`, rendered in Europe/Helsinki

`scheduledAt` is stored as UTC. Helsinki wall-clock input is converted
at write time via `date-fns-tz`. This is correct across DST transitions
(twice per season). No fixed-offset arithmetic anywhere.

### 5. Auto-generation is **pulled forward** from Phase 4 to Phase 1

Originally Phase 4 was the only phase with auto-generation, and Phase 1
would have shipped manual-only session creation. We pulled a **dumb
baseline auto-gen** into Phase 1: one item per section, no-repeat
within a rolling 3-session window applied within-batch only,
type-only fallback when the exercise bank is sparse. Phase 4 will
layer progression intelligence on top.

Reason: without auto-gen, the "add sessions" form is just bulk manual
entry — saves keystrokes but doesn't validate that the season concept
adds value. Dumb auto-gen is enough to confirm the workflow before
investing in progression algorithms.

### 6. Phased delivery: A → prototype → B → C → D, then Phase 2/3/4

- **PR A** (#35, `d116a4c`): schema migration only. No UI.
- **Prototype** (commit `c30f1c9`): UI-only mock at
  `/prototypes/season-form` to validate ergonomics before backend code
  exists. Deleted before PR B.
- **PR B** (#37, `de755c8`): season CRUD routes.
- **PR C** (#38, `9abc18e`): `/seasons/$slug/add-sessions` + auto-gen.
- **PR D** (#39, `aabcd76`): standalone-vs-season cleanup, nav, home
  card.
- **Phase 2** (#40, `f39eaf7`): coverage view (read-only "what you've
  covered").
- **Phase 3** (#41, `4c765aa`): hints (warnings for unbalanced or
  repeating seasons).
- **Phase 4** (commit `9331377` outlines scope): progression-aware
  auto-generation — **not yet implemented.**

### 7. No `weekNumber` column

Calendar week and "session N of season" are both **derived** from
`scheduledAt` at view time (`getISOWeek` and `row_number() over (...)`).
Storing them would create two sources of truth that drift on date edits.

### 8. `seasonId` mutable in schema, immutable in UI (Phase 1)

The FK has `onDelete: SetNull` and is technically free to change. The
edit form intentionally does **not** expose a season selector for
Phase 1 — cross-season moves will land when there's actually more than
one season.

## Alternatives considered

- **Model a season as a tag/category on `PracticeSession`.** Rejected:
  defaults (weekday, start time, duration), date ranges, and slugs all
  belong to the season, not the session. A tag has no place to store
  this.
- **Embed season as a JSON column on `PracticeSession`.** Rejected:
  duplicates season metadata across every member session; updates
  become rewrite-many; fundamentally the wrong shape.
- **Store wall-clock local time directly (no UTC conversion).**
  Rejected: DST transitions during the coaching season would silently
  shift the displayed time of October sessions created in spring.
- **Eagerly generate the entire season's worth of sessions on season
  creation.** Rejected: too rigid. The "add N sessions at a time"
  flow lets coaches react to the actual calendar, vacations, and
  cancellations.
- **Propagate season-default changes to existing sessions.** Rejected:
  see decision #3 — sessions should snapshot defaults, not subscribe
  to them.
- **Store `weekNumber` and "session N" as columns.** Rejected: derive
  from `scheduledAt` to avoid drift.
- **Skip auto-generation in Phase 1.** Rejected: see decision #5 — a
  dumb baseline validates the season concept before committing to
  Phase 4's algorithm.
- **Build season + Phase 4 progression in one big release.** Rejected:
  too much risk for a feature whose core ergonomics are unvalidated.
  The phased plan is partly explicit risk-management.

## Consequences

### Positive

- Existing standalone-session data stays valid; no migration risk.
- Schema is purely additive — one new table, three new nullable columns,
  one composite index.
- Phase 1's narrow scope was achievable in 4 PRs across ~2 weeks.
  Phases 2 and 3 layered on without schema changes.
- The plan doc itself is a useful artefact — it answered design
  questions ahead of code, and PRs A–D could be reviewed against it.
- Auto-gen is a pure function (`sessionAutoGenerator.server.ts`) given
  a DB context, making it unit-testable.

### Negative / costs

- The codebase now has **two parallel session-creation paths** — manual
  (`/practise-sessions/new`) and batch (`/seasons/$slug/add-sessions`)
  — that share the same model but diverge on UX and defaults.
- The `seasonId` immutability is a UI-only constraint. Anyone reading
  the schema will see a mutable FK and may be surprised it's not
  exposed in the form.
- The exercise bank is sparse, so Phase 1's auto-gen falls back to
  type-only items often. Acceptable but noted in the spec as a known
  limitation.
- Phase 4 (progression-aware auto-gen) is the actual product goal but
  not yet built. Until it lands, season planning is "structured manual
  entry with light variety enforcement," not "the system plans my
  season for me."
- DST correctness depends on always converting through the named zone.
  A future contributor adding date arithmetic in raw UTC offsets could
  silently break this — flagged here because it would be a subtle bug.

### Neutral / follow-ups

- A "regenerate programme" per-session button was deferred from
  Phase 1. If users hit the bank-sparse fallback often, this becomes
  a useful escape hatch.
- The auto-gen's "rolling 3-session window" variety rule is
  within-batch only. Cross-batch repeats are accepted; an upgrade to
  cross-batch tracking is a code change with no schema impact.
- Phase 4 should not amend this ADR — it should be its own ADR
  describing the progression algorithm and how it interacts with the
  Phase 1 baseline.
- If multi-coach support ever lands (User table, auth), `Season`
  ownership becomes a real concern. Out of scope today.

## References

- Spec doc: `docs/18 - season planning feature plan.md`
- Plan PR: [#33 docs/season-planning-plan](https://github.com/janimattiellonen/Harkkapankki/pull/33)
- PR A — schema: [#35](https://github.com/janimattiellonen/Harkkapankki/pull/35), commit `d116a4c`
- PR B — CRUD: [#37](https://github.com/janimattiellonen/Harkkapankki/pull/37), commit `de755c8`
- PR C — add-sessions + auto-gen: [#38](https://github.com/janimattiellonen/Harkkapankki/pull/38), commit `9abc18e`
- PR D — cleanup + nav: [#39](https://github.com/janimattiellonen/Harkkapankki/pull/39), commit `aabcd76`
- Phase 2 — coverage: [#40](https://github.com/janimattiellonen/Harkkapankki/pull/40), commit `f39eaf7`
- Phase 3 — hints: [#41](https://github.com/janimattiellonen/Harkkapankki/pull/41), commit `4c765aa`
- Phase 4 scope notes: commit `9331377`
- Code: `prisma/schema.prisma` (Season model), `app/repositories/season.server.ts`, `app/services/sessionAutoGenerator.server.ts`, `app/utils/timezone.ts`
