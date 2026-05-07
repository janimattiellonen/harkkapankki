# 0008. Practice session retrospective as a private, inline subresource

- **Status:** Proposed
- **Date:** 2026-05-07
- **Deciders:** janimattiellonen
- **Related:** Issue [#60](https://github.com/janimattiellonen/Harkkapankki/issues/60), spec at `docs/prompts/Exercise retrospective.md`

## Context

Harkkapankki today models the _plan_ for a practice session
(`PracticeSession` + `PracticeSessionSectionItem`) but has no place
for the _outcome_: how many participants showed up, what actually got
run, what worked, what to improve. The author writes the weekly
programme the day-of and currently has nowhere in the app to record
post-session reflections that would feed back into next week's plan
and into the long-term season-planning vision (ADR-0006).

Constraints in play:

- **Single-user, public-no-auth dev state.** No login, no permissions
  layer (per project vision; multi-user is out of scope until the
  junnufriba handover).
- **Privacy intent.** The retrospective content is for the coach's
  eyes only. If the app is ever made public, retros must remain
  hidden behind authentication and never appear on any public route.
- **CRUD convention.** Every existing first-class resource (Exercise,
  PracticeSession, Season) has its own slug, dedicated routes
  (`new` / `$slug` / `$id_.edit`), and repository functions.
- **Markdown tooling already exists** in the project
  (`react-md-editor`, `react-markdown-preview`) and is used for
  `Exercise.content`.

## Decision

### 1. Retrospective is an inline subresource, not a first-class entity

The retrospective is always reached _through_ its parent practice
session. It has **no slug**, **no dedicated routes**, and **no
listing page**. Add / view / edit / delete all happen inline on
`/practise-sessions/$slug`. The session detail page is the only
surface.

### 2. Cardinality 0..1 enforced at the database

A new table `practice_session_retrospectives` with
`practice_session_id` as a `@unique` foreign key — at most one
retrospective per session, enforced by Postgres rather than by
application code.

### 3. Cascade delete from PracticeSession

`onDelete: Cascade` — deleting a session removes its retrospective.
Retros have no meaning detached from their session.

### 4. Privacy as a release-blocking constraint, not technical gating

Today the retrospective renders inline on the session page with no
auth gate (because the app has no auth). Before any public deployment:

- Retros must be hidden behind authentication, OR
- The retrospective fields must be omitted from server responses for
  unauthenticated requests.

This is a **release-blocking checklist item** for
`agent-skills:shipping-and-launch`. We do **not** add an env-flag
belt-and-braces today — the eventual fix is real auth, and a flag
would be dead code by then.

### 5. Field shape

Four fields:

- `participantCount: Int` — required, 0–100 (Zod-validated).
- `summary: String @db.Text` — required, markdown, "what we did."
- `wentWell: String? @db.Text` — optional, markdown.
- `improvements: String? @db.Text` — optional, markdown.

Plus `id`, `practiceSessionId`, `createdAt`, `updatedAt`.

### 6. Markdown reuse, not a new editor

Reuse the existing `react-md-editor`-based component used for
`Exercise.content`. No new editor, no new dependency.

### 7. Indicator on the practice sessions list

The practice sessions index page shows a small icon/badge on rows
that have a retrospective, so coverage is glanceable without
opening each session.

## Alternatives considered

- **Retrospective as a first-class resource with its own slug and
  routes.** Rejected — needless ceremony for a tightly coupled
  subresource. The retro has no meaningful identity outside its
  parent session, no need to link to it, and no listing surface.
- **Embed retro fields directly on `PracticeSession`.** Rejected —
  mixes plan with outcome on the same row; adds four nullable
  columns to a frequently-loaded table; muddies the lifecycle
  (creating/deleting retros becomes UPDATEs on the session).
- **Multiple retrospectives per session (0..N).** Rejected — no
  identified use case. If history-of-edits ever matters, drop the
  `@unique` and add an order/version column. Today, edit-in-place
  is sufficient.
- **Soft delete (`deletedAt` column).** Rejected — personal coaching
  notes, no audit/compliance need. Hard delete + confirmation dialog
  is the right level of safety.
- **Env flag (`SHOW_RETROSPECTIVES`) for pre-auth privacy.** Rejected
  — adds noise for a deployment scenario that's months/years out and
  will be replaced by real auth. Capturing privacy as a release-blocker
  in this ADR is the durable mechanism.
- **Standalone "all retrospectives" listing page.** Rejected for
  MVP — out of scope. Easy to add later if cross-session browsing
  becomes a need.
- **Pre-fill `summary` from the planned program.** Rejected for MVP
  — out of scope; the planned program is on the same page already.
  Could be a one-click "import program summary" later.
- **Separate route for create/edit (matching the per-resource
  pattern).** Rejected — the inline flow matches how a retro is
  actually used (re-read while editing). Documented here so future
  contributors know the deviation is deliberate.

## Consequences

### Positive

- Schema is purely additive — one new table, one FK that is both
  `@unique` and `onDelete: Cascade`.
- Lifecycle is fully described by the parent session — delete the
  session, the retro goes with it.
- Inline UX matches the read-while-editing reality of writing
  reflections.
- Reuses existing markdown editor — no new dependency.
- The retro is discoverable via the indicator on the sessions list
  without adding a new top-level navigation item.

### Negative / costs

- Departure from the per-resource-route CRUD convention. A future
  contributor scanning `app/routes/` will notice retros have no
  routes; this ADR is the answer to "why?"
- Privacy enforcement is **process-bound**, not technically enforced.
  An accidental public deployment without first adding auth would
  expose retros. Mitigated by: (a) ADR explicitness, (b) a
  release-blocking checklist item, (c) the project being explicitly
  pre-handover with no current public deployment.
- The `@unique` constraint locks 0..1 cardinality — if 0..N is ever
  needed, schema migration required (drop unique, add order/version).

### Neutral / follow-ups

- If cross-session reflection becomes valuable (e.g., season-level
  rollups), revisit with a follow-up ADR rather than amending this one.
- If the season-planning roadmap (Phase 4 of ADR-0006) wants to
  consume retrospective signals as inputs to progression decisions,
  that's a separate design.
- If a "regenerate / duplicate retro" flow ever shows up as
  desirable, treat it as a new decision, not an extension of this ADR.

## References

- Spec prompt: `docs/prompts/Exercise retrospective.md`
- Issue: [#60](https://github.com/janimattiellonen/Harkkapankki/issues/60)
- Related: ADR-0003 (i18n), ADR-0006 (season planning context),
  ADR-0007 (one query per file)
- Code (post-implementation): `prisma/schema.prisma`,
  `app/repositories/queryRetrospective*.server.ts`,
  `app/pages/PractiseSessionDetail.tsx`
