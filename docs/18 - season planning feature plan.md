# Season planning feature — plan

This is the design plan for the season planning feature. Doc 16 (exercise type hierarchy changes) is a prerequisite and has already been resolved.

## Why this feature

The personal goal of Harkkapankki is to make weekly junior practice planning fast and dependable. The longer-term goal is to plan a **whole season** of practices: a sequence of weekly sessions that vary deliberately and progress logically. This document is the first step toward that longer-term goal.

The author runs weekly sessions for under-18 juniors between April and October. A season is roughly 20–25 weeks but the exact end is rarely known in advance — previous seasons have ended in mid-October. Sessions are normally weekly on a fixed weekday and time (example: Wednesdays, 17:00–18:30, 1.5 hours), but the day, time, and length may vary between seasons. Within a season the cadence may have gaps for vacation, sick days, or canceled sessions.

## Context — current data model (summary)

The full report from the data-model exploration is summarised here:

- **DB**: PostgreSQL via Prisma.
- **PracticeSession**: top-level row with `name`, `description`, `sessionLength` (60 or 90), unique `slug`, and `createdAt` / `updatedAt`. No parent.
- **PracticeSessionSectionItem**: join row linking a session to a (section, exercise type, optional exercise) with an `order`.
- **Section**: 5 fixed sections, stored in DB rows with order; translated via `SectionTranslation`.
- **SectionDurationConfig**: per-(section, sessionLength) duration in minutes. Two rows per section, one for 60 min and one for 90 min.
- **ExerciseType**: hierarchical (self-FK `parentId`); translated via `ExerciseTypeTranslation`.
- **Exercise**: leaf items with `name`, `description`, rich `content`, `image`, `youtubeVideo`, `duration`, FK to `ExerciseType`.
- **No User / Auth table.** All data is global.
- **No soft-delete fields anywhere.** Most FKs cascade on delete; the exception is `PracticeSessionSectionItem.exerciseId`, which uses `onDelete: SetNull` so past sessions remain valid when an exercise is deleted (the row keeps its session, section, and exercise type — only the specific drill reference becomes null).

The schema is well-normalized and extending it for seasons is mostly additive.

## Decisions (settled)

### Schema

1. **Season is a first-class entity.** A new `Season` table is added.
2. **Sessions are scheduled to specific dates.** A `scheduledAt` (`DateTime?`, UTC `timestamptz`) field is added to `PracticeSession`. Nullable: sessions without a date are drafts.
3. **No `SeasonTranslation` table.** Season uses plain `name` and `description` columns, matching the pattern for user-created content (`Exercise`, `PracticeSession`). Season names are coach-typed and don't need translation.
4. **`scheduledAt` stored as UTC `timestamptz`.** Helsinki wall-clock times are converted to UTC at write time via a TZ helper (`date-fns-tz` or equivalent). This is correct across DST transitions, which Finland's coaching season spans twice.
5. **`defaultStartTime` is `String?` "HH:MM" with app-layer Zod validation.** Matches the codebase's "type + Zod" pattern (e.g., `sessionLength` is a plain `Int` with no DB CHECK constraint). End time in the UI is derived from `defaultStartTime + defaultDurationMin`.
6. **`defaultDayOfWeek` is `Int?` using ISO 8601 (Monday=1, Sunday=7).** Documented inline on the column.
7. **Defaults are copy-on-create.** When a session is created in a season, `sessionLength` (and other defaults) is copied from the season at write time. Editing the season's defaults later does not propagate to existing sessions.
8. **Session lengths stay 60 / 90.** Generalising the duration model is deferred.
9. **One composite index `@@index([seasonId, scheduledAt])` on `PracticeSession`.** Serves both "list sessions in this season ordered by date" and "filter by season alone." No standalone `scheduledAt` index.
10. **`seasonId` is mutable in the schema** (free, nullable FK with `onDelete: SetNull`) **but not exposed in the session edit form for Phase 1.** Cross-season moves will be added when the user actually has multiple seasons.
11. **Validation rules live at the app layer (Zod), not the DB.** Includes: `defaultDurationMin ∈ {60, 90}`; `endDate >= startDate` when both set; `defaultStartTime` matches `/^([01]\d|2[0-3]):[0-5]\d$/`; `defaultDayOfWeek ∈ 1..7`; `Season.name` required.

### Auto-generation (pulled forward from Phase 4 to Phase 1)

12. **Auto-generation runs at session-creation time** during the batch "Add sessions" flow. The manual `/practise-sessions/new` flow stays manual — no auto-gen there.
13. **One item per section per session.** Each generated session has 5 items (one per fixed section).
14. **Prefer specific exercises, fall back to type-only.** For each section, the algorithm picks an `Exercise` from a type linked to that section via `SectionExerciseType`. If no eligible `Exercise` is available, emit type-only.
15. **Variety = no drill repeats within a rolling 3-session window, applied within-batch only.** When generating session N in a batch, exclude specific exercises used by sessions N-1 and N-2 in the same batch. Cross-batch repeats are accepted (can be upgraded later without schema change).
16. **Sparse-bank fallback.** When fresh drills are exhausted, emit type-only items and surface a soft warning to the coach: "Putting bank is sparse, sessions 4–5 are type-only — consider adding more drills."

### UX boundaries

17. **Season detail page (`/seasons/$slug`)** shows: name + description + date range + defaults + Edit button at the top; a linear list of sessions ordered by `scheduledAt` ascending; a separate "Add sessions" route (not modal); list split into "Upcoming" and "Past" sections, with drafts (NULL `scheduledAt`) at the bottom of "Upcoming."
18. **`/practise-sessions` global list filters to standalone sessions only** (`seasonId IS NULL`). Season-attached sessions are accessed via the season detail page. The list shows an info banner pointing to the Seasons surface.
19. **Home page gains a new "Seasons" card** alongside the existing three. The "Design a practice session" card continues to lead to `/practise-sessions/new` and creates a standalone session by default.

### "Add sessions" form

20. **N-row inline-edit form** — user picks how many sessions (typically 1–10), the form renders N rows, each pre-filled with the season's defaults (date computed from `defaultDayOfWeek` rolling forward; start time and end time displayed inline). Coach can edit any row's date / start time / end time before submitting.
21. **Date window starts at the later of (today, `season.startDate`).**
22. **Past dates are hidden.** Backfilling past sessions uses the manual flow.
23. **If the season has no `defaultDayOfWeek`, the action is blocked** with a message directing to the season settings page.

### Existing-data handling

24. **Existing standalone sessions are left as-is.** They get `seasonId = NULL` after migration. They are example data and don't need backfilling.
25. **Doc 16 is resolved** (Phase 0 prerequisite). Season planning UI builds on top of the resolved exercise type hierarchy work.

## Schema changes

### New table: `Season`

```prisma
model Season {
  id                  String   @id @default(uuid())
  slug                String   @unique
  name                String
  description         String?
  startDate           DateTime?
  endDate             DateTime?
  defaultDayOfWeek    Int?     // ISO 8601: 1=Monday, 7=Sunday
  defaultStartTime    String?  // wall-clock "HH:MM" in Europe/Helsinki, validated by Zod
  defaultDurationMin  Int?     // 60 or 90, validated by Zod
  practiceSessions    PracticeSession[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@map("seasons")
}
```

Notes:

- `endDate` is nullable because seasons rarely have a known end date in advance.
- Defaults (`defaultDayOfWeek`, `defaultStartTime`, `defaultDurationMin`) are used to seed sessions at creation time only. Editing them later does not propagate to existing sessions.
- `slug` is unique within the `seasons` table; uses the existing `slugify` + `makeUniqueSlug` helpers.

### Additions to `PracticeSession`

```prisma
seasonId    String?   @map("season_id")
season      Season?   @relation(fields: [seasonId], references: [id], onDelete: SetNull)
scheduledAt DateTime? @map("scheduled_at")  // UTC timestamptz; converted from Helsinki wall-clock at write time

@@index([seasonId, scheduledAt])
```

Notes:

- `seasonId` is nullable. Existing seasonless sessions remain valid after migration.
- `onDelete: SetNull` means deleting a season does not delete its sessions — they fall back to standalone.
- `scheduledAt` is nullable. Drafts (NULL) sort to the bottom of the "Upcoming" list.
- The composite index `@@index([seasonId, scheduledAt])` serves both "filter by season ordered by date" and "filter by season alone" via the leading column. No additional index on `scheduledAt` alone.
- **No `weekNumber` column.** Both calendar week and "session N of the season" are derived from `scheduledAt` at view time (`getISOWeek(scheduledAt)` and `row_number() over (partition by seasonId order by scheduledAt)` respectively).

### Migration approach

- One Prisma migration adds the `Season` table and the three columns on `PracticeSession`.
- No data backfill — all existing rows get `NULL` for the new columns.
- No new index strictly required for Phase 1; revisit if season-scoped queries get slow.

## Code changes (high-level)

### Repositories / services

- New: `app/repositories/season.server.ts` (CRUD).
- New: `app/services/seasons.server.ts` (slug generation, date seeding from defaults, anything cross-cutting).
- New: `app/services/sessionAutoGenerator.server.ts` (the auto-gen algorithm — pure picking logic given a DB context, easy to unit-test).
- New: `app/utils/timezone.ts` (Helsinki ↔ UTC conversion helpers built on `date-fns-tz`).
- Update: `app/repositories/practiceSession.server.ts` — accept optional `seasonId` filter and `scheduledAt` field on writes.

### Routes

- `/seasons` — list of seasons (name, date range, session count).
- `/seasons/new` — create-season form. (When the user adopts the "create season + N initial sessions" combined flow, this route hosts that combined form.)
- `/seasons/$slug` — season overview: metadata header, "Edit season" button, "Upcoming" + "Past" linear lists of sessions ordered by `scheduledAt`.
- `/seasons/$slug/edit` — edit season metadata.
- `/seasons/$slug/add-sessions` — N-row inline-edit form for adding sessions to an existing season.
- `/practise-sessions` — **filtered to standalone sessions only** (`seasonId IS NULL`) with an info banner pointing to the Seasons surface.
- `/practise-sessions/new` — gains an optional `seasonId` query param + a `scheduledAt` field. When invoked from the home card, both are absent and a standalone session is created.
- `/practise-sessions/$slug` — existing detail view, with a back-link to its season when one is set.

### Forms

- New `SeasonForm` for create/edit.
- New `AddSessionsForm` — N-row inline editor (count selector + N rows of date/start time/end time), shared between the season-creation combined flow and the existing-season add flow. End time is rendered derived from start time + duration; editing it inline reverse-computes duration.
- `PractiseSessionForm` gains an optional `scheduledAt` field and shows a read-only "part of season X" badge when `seasonId` is set. Crucially, the form does **not** expose a season selector — `seasonId` is set at creation only and not editable for Phase 1.

### Auto-generation algorithm

Pseudocode for the function called inside `/seasons/$slug/add-sessions` (and the season-creation combined flow):

```
generateProgrammeForBatch(season, rows):
  newSessions = []
  for i in 0..rows.length:
    row = rows[i]
    excludedExerciseIds = collect specific Exercise IDs from
                          newSessions[max(0, i-2)..i-1]  // rolling 3-window, batch-only
    items = []
    for section in seasonSections:                       // 5 fixed sections
      eligibleTypes = SectionExerciseType for this section
      pickedExercise = first Exercise from eligibleTypes
                       NOT in excludedExerciseIds, ordered by some randomization
      if pickedExercise:
        items.push({ section, exerciseType: pickedExercise.exerciseType,
                     exerciseId: pickedExercise.id, order: section.order })
      else:
        items.push({ section, exerciseType: pick any eligibleType, order: section.order })
        emit warning: "section X has no fresh drill; using type-only"
    newSessions.push({ session: row, items })
  return newSessions
```

All writes happen in a single transaction — either all sessions in the batch save, or none do.

### i18n

- New translation keys for season UI (FI + EN).
- Same translation strategy as existing entities — keys in `/public/locales/{fi,en}.json`.

### Slugs

- `Season.slug` unique within the `seasons` table; uses the existing `slugify` + `makeUniqueSlug` helpers.
- `PracticeSession.slug` continues to be unique within `practice_sessions`. No nested URLs in Phase 1.

## Phased rollout

- **Phase 0** — _resolved._ Doc 16 (exercise type hierarchy) is done; the session designer UI is stable.
- **Phase 1** — Season CRUD; `scheduledAt` per session; "Add sessions" N-row form; **basic auto-generation** (one item per section, within-batch variety, type-only fallback when sparse); standalone vs season cleanup; home page nav. **This phase delivers the personal goal.**
- **Phase 2** — Coverage stats. Read-only "what you've covered" view per season: which exercise types appear in which sessions, frequency, gaps. No suggestions yet — just visibility.
- **Phase 3** — Smart suggestions. The system warns when a season is unbalanced ("no putting in last 3 sessions") or repeats too quickly. Coach decides what to do; nothing enforced.
- **Phase 4** — **Progression-aware auto-generation.** The system proposes a full season plan that introduces and builds on techniques in a sensible order. The Phase 1 auto-gen is the dumb baseline; Phase 4 layers progression intelligence on top. **This is the north star.**

## Sequencing / PR plan

Phase 1 ships across four PRs plus a UX-validation prototype:

1. **PR A — Schema migration.** Adds the `Season` table, `seasonId` and `scheduledAt` columns on `PracticeSession`, the composite index. No app code beyond regenerated Prisma types.
2. **Prototype (UI-only).** A render-only mock of the "create season + N initial sessions" combined form at `/prototypes/season-form`. Real interactivity (count selector adjusts rows, date/time pickers work, validation triggers) but **no DB writes** — submit hits a mock success state. Purpose: pin down form ergonomics and weed out bad ideas before backend code is written. Revise this doc with whatever the prototype reveals before continuing. The route is deleted in PR B (or one before) when the real implementation lands at `/seasons/new`.
3. **PR B — Season CRUD.** Routes `/seasons`, `/seasons/new`, `/seasons/$slug`, `/seasons/$slug/edit`, delete. Uses the form shape validated by the prototype.
4. **PR C — Add sessions + auto-gen.** Route `/seasons/$slug/add-sessions`, the auto-gen algorithm (with unit tests), atomic batch creation.
5. **PR D — Standalone vs season cleanup + nav.** `/practise-sessions` filters to standalone-only; `PractiseSessionForm` gains `scheduledAt`; `/practise-sessions/new` accepts `seasonId` query param; home page gets the "Seasons" card.

Between PR A and PR B, the schema is in `main` but no UI uses it — safe state, hidden by lack of nav links until PR D.

## Issues / blockers / risks

1. **Content shortage.** The exercise bank covers a fraction of junnufriba.fi today. The Phase 1 auto-gen will hit type-only fallback often until the bank fills out. Mitigation: surface the soft warning ("sessions 4–5 are type-only") so the coach knows when adding more drills would help most. Doesn't block Phase 1.
2. **No auth.** Fine for solo use. If junnufriba ever runs the project for multiple coaches, "my season" needs a User table — out of scope here, noted for the longer term.
3. **Calendar/timezone correctness.** Settled: store `scheduledAt` as UTC `timestamptz`, render in Europe/Helsinki, accept user input as Helsinki-local. Adds a dependency on `date-fns-tz` (or equivalent). DST transitions (last Sunday of March, last Sunday of October) are correctly handled by always converting through the named zone, never through fixed UTC offsets.
4. **Auto-gen quality is unproven until we use it.** The Phase 1 algorithm is intentionally simple (one item per section, within-batch variety only). Whether the generated sessions feel useful depends on bank coverage and the random-pick distribution. Mitigation: the prototype + first real PR-C usage will surface this fast; revise the algorithm before Phase 2.
5. **Auto-gen needs unit tests.** The picking logic is a pure function given a DB context (eligible types, candidate exercises, exclusion set). Phase 1's PR-C should ship with unit tests covering: one item per section, exclusion-set respected, type-only fallback when no fresh drill, deterministic behavior under a seeded RNG.

## Open implementation details to settle later

These are not schema or design decisions — they're UX/UI choices that don't change the database and can be settled when Phase 1 is being built:

- Specific date and time picker components (decided during the prototype).
- Per-session "Regenerate programme" button — deferred to Phase 1.5 or later. Phase 1 has no regeneration; if a generated session is bad, you delete and re-create.
- `/seasons` list page sort order, empty-state copy, and CTA placement.
- Edit season form layout (assumed mirror of create form).
- Delete season UX: confirmation dialog wording. The `onDelete: SetNull` behavior makes "sessions detach to standalone" the default; the dialog just confirms.
- Visual treatment of past vs upcoming sessions on the season detail page (de-emphasis, separator styling).
- i18n keys for new copy (mechanical; FI + EN).
