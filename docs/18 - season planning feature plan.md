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

1. **Season is a first-class entity.** A new `Season` table will be added.
2. **Sessions are scheduled to specific dates.** A `scheduledAt` (datetime) field will be added to `PracticeSession`. Nullable, so sessions without a planned date are valid (drafts).
3. **Session lengths stay 60 / 90.** Generalising the duration model is deferred until a real need appears.
4. **Existing standalone sessions are left as-is.** They get `seasonId = NULL` after migration. They are example data and don't need backfilling into a season.
5. **Doc 16 is resolved.** Season planning UI builds on top of the resolved exercise type hierarchy work; there is no in-flux session-designer dependency.

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
  defaultDayOfWeek    Int?     // 0-6, used to seed dates for new sessions
  defaultStartTime    String?  // "17:00"
  defaultDurationMin  Int?     // 60 or 90
  practiceSessions    PracticeSession[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

Notes:

- `endDate` is nullable because seasons rarely have a known end date in advance.
- Defaults (`defaultDayOfWeek`, `defaultStartTime`, `defaultDurationMin`) are used when creating new sessions inside the season — each session can still override them.
- `slug` follows the existing global-unique pattern (`slugify` + `makeUniqueSlug`).

### Additions to `PracticeSession`

```prisma
seasonId    String?   @map("season_id")
season      Season?   @relation(fields: [seasonId], references: [id], onDelete: SetNull)
scheduledAt DateTime? @map("scheduled_at")
```

Notes:

- `seasonId` is nullable. Existing seasonless sessions remain valid.
- `onDelete: SetNull` means deleting a season does not delete its sessions — they fall back to standalone. Safer default than cascade. Worth confirming when this is implemented.
- `scheduledAt` is nullable. Sessions without a date are drafts and sort to the end of the season list.
- **No `weekNumber` column.** Both calendar week and "session N of the season" can be derived from `scheduledAt` at view time (`getISOWeek(scheduledAt)` and `row_number() over (partition by seasonId order by scheduledAt)` respectively). Storing it would create an integrity problem when sessions are reordered or rescheduled.

### Migration approach

- One Prisma migration adds the `Season` table and the three columns on `PracticeSession`.
- No data backfill — all existing rows get `NULL` for the new columns.
- No new index strictly required for Phase 1; revisit if season-scoped queries get slow.

## Code changes (high-level)

### Repositories / services

- New: `app/repositories/season.server.ts` (CRUD).
- New: `app/services/seasons.server.ts` (slug generation, date seeding from defaults, anything cross-cutting).
- Update: `app/repositories/practiceSession.server.ts` — accept optional `seasonId` filter and `scheduledAt` field on writes.

### Routes

- `/seasons` — list of seasons (name, date range, session count).
- `/seasons/new` — create-season form (name, description, optional dates, defaults).
- `/seasons/$slug` — season overview: list of sessions ordered by `scheduledAt`, calendar view, "add sessions" action.
- `/seasons/$slug/edit` — edit season metadata.
- `/practise-sessions/new?seasonId=...` — existing form, prefilled with season defaults.
- `/practise-sessions/$slug` — existing detail view, with a back-link to its season when one is set.

### Forms

- `PractiseSessionForm` gains an optional `scheduledAt` field and shows "part of season X" when `seasonId` is set.
- New `SeasonForm` for create/edit.

### "Add sessions" UX (Phase 1)

- Inside `/seasons/$slug`, an action to add multiple sessions at once.
- Calendar UI showing the next ~20 occurrences of the season's `defaultDayOfWeek` starting from today.
- Each occurrence is toggleable (click to add / remove a session for that date).
- Each toggled-on date creates a `PracticeSession` with `scheduledAt` set, `seasonId` set, `sessionLength` = season's `defaultDurationMin`, and an empty section-item list ready to be filled in later.
- The user can then click any session to design its content via the existing session designer.

### i18n

- New translation keys for season UI (FI + EN).
- Same translation strategy as existing entities — keys in `/public/locales/{fi,en}.json`.

### Slugs

- Keep the existing global-unique pattern. Two seasons named "Week 1" become `week-1` and `week-1-2`.
- Nested URLs (`/seasons/spring-2026/week-1`) are a future polish, not a Phase 1 concern.

## Phased rollout

- **Phase 0** — _resolved._ Doc 16 (exercise type hierarchy) is done; the session designer UI is stable.
- **Phase 1** — Season CRUD. Sessions can be attached to a season. `scheduledAt` per session. "Add sessions" calendar action. Session lists filterable by season. **This phase delivers the personal goal.**
- **Phase 2** — Coverage stats. Read-only "what you've covered" view per season: which exercise types appear in which sessions, frequency, gaps. No suggestions yet — just visibility.
- **Phase 3** — Smart suggestions. The system warns when a season is unbalanced ("no putting in last 3 sessions") or repeats too quickly. Coach decides what to do; nothing enforced.
- **Phase 4** — Auto-generation. The system can propose a full season plan given a target group and a time window. **This is the north star.**

## Issues / blockers / risks

1. **Content shortage.** The exercise bank covers a fraction of junnufriba.fi today. Variety/repetition logic in Phase 2+ will produce weak signals until coverage improves. Doesn't block Phase 1.
2. **No auth.** Fine for solo use. If junnufriba ever runs the project for multiple coaches, "my season" needs a User table — out of scope here, noted for the longer term.
3. **Calendar/timezone correctness.** `scheduledAt` is a `DateTime` — needs care around timezone handling at form submission, especially for daylight-saving transitions in spring/autumn (the project's coaching season spans both DST changes in Finland). Worth a small explicit decision: store in UTC, render in Europe/Helsinki, accept user input as Helsinki-local.

## Open implementation details to settle later

These are not schema or design decisions — they're UX/UI choices that don't change the database and can be settled when Phase 1 is being built:

- Visual treatment of the calendar in "Add sessions" (grid? list? inline calendar component?).
- Should past sessions be visually de-emphasised in the season overview?
- What does the season list look like when there are no seasons yet (empty state)?
- Should deleting a season prompt about its sessions ("convert to standalone" vs "delete with season")? — `onDelete: SetNull` makes "convert to standalone" the default behavior; the prompt would just confirm.
