# 0001. Side-panel exercise preview on practise session detail

- **Status:** Accepted
- **Date:** 2026-05-06
- **Deciders:** janimattiellonen
- **Related:** PR #53, spec at `docs/prompts/practise session view improvements.md`, commit `ca8c363`

## Context

The practise session detail page (`/practise-sessions/:slug`) lists the exercises
that belong to a session. Exercises that exist in the catalogue render as text
links to `/exercises/:slug`. Until now the only way to review an exercise's
content (description, image, embedded video, markdown body) was to open the link
in a new tab.

When a coach is planning or reviewing a session this means juggling tabs:
read item → open exercise in tab → switch tab → read → switch back → next item.
For a session with 8–12 linked exercises this is the dominant friction in the
workflow. The spec called out that the main area "could be split into two
columns (one with the existing content and the other with the selected
exercise visible)" and asked for a small preview icon next to each linked
exercise.

Constraints:

- Items _without_ a linked exercise (free-text section items) should not get
  the affordance — there is nothing to preview.
- The existing "open in new tab" behaviour is used and should not be taken
  away.
- The exercise body uses `@uiw/react-md-editor` for markdown rendering, which
  is a heavy client-only dependency that the session detail page does not
  otherwise load.
- The session list view is dense on mobile; we cannot afford to break or
  cramp that layout.

## Decision

We add a side-panel preview rendered inline on the same page, opened by
clicking a small panel-icon button placed next to each linked exercise. The
existing exercise text link is preserved and continues to open in a new tab.

Concretely:

- A new `ExercisePreviewPanel` component (`app/components/ExercisePreviewPanel.tsx`)
  fetches the exercise via `useFetcher` against the existing
  `/exercises/:slug` route — **no new API endpoint, no new loader, no
  prop-drilled data.**
- The markdown renderer (`@uiw/react-md-editor`) is **dynamically imported**
  inside the panel, so it is only fetched when a user actually opens a
  preview.
- `PractiseSessionDetail` holds a single `selectedSlug` state. When set, the
  page switches from a single column to a two-column flex layout at the `lg`
  breakpoint and up; on smaller screens the panel stacks below the list.
- The panel is `lg:sticky lg:top-4` with `max-h-[calc(100vh-2rem)] overflow-y-auto`
  so it stays visible while the user scrolls the section list.
- The preview button uses `aria-pressed` to convey active state and
  `aria-label` (i18n key `sessions.previewExercise`) for screen readers.
- Items with no linked exercise render no button at all — empty affordance is
  worse than no affordance.

## Alternatives considered

- **Modal / dialog overlay.** Rejected: blocks the section list, breaks the
  "I want to compare exercise contents against the surrounding session
  structure" use case, and adds focus-trap complexity for no UX gain.
- **Inline expand under each list item (accordion).** Rejected: pushes the
  rest of the list down, loses the "scan the session, peek at exercises"
  flow, and would need its own scroll handling for long markdown bodies.
- **Navigate to the exercise detail page in the same tab.** Rejected: that's
  effectively what we have today minus the new tab; the back-button round
  trip is the friction the spec is trying to remove.
- **Status quo (only "open in new tab").** Rejected: this is the explicit
  problem the spec describes. New-tab behaviour is _retained_ as the
  secondary affordance — the text link still opens in a tab — so users who
  prefer that workflow lose nothing.
- **Server-side: pre-load every exercise's content into the session loader.**
  Rejected: pays full bandwidth and markdown-render cost up front for content
  the user may never preview, and bloats the initial HTML payload.

## Consequences

### Positive

- Removes tab-juggling for the dominant session-review flow.
- No new backend surface — reuses the existing exercise route's loader.
- Markdown bundle stays out of the critical path for users who don't open a
  preview (lazy-loaded on first open).
- Both affordances coexist: power users keep "middle-click → new tab", the
  preview button covers the common case.

### Negative / costs

- `PractiseSessionDetail` grows a new `ExerciseLink` wrapper component and
  conditional layout branching (`selectedSlug ? two-col : one-col`). The page
  is now meaningfully more complex than it was.
- Two ways to look at an exercise from this page is a duplicated affordance —
  if we ever change navigation patterns we need to revisit both.
- The panel re-fetches on each `slug` change. We do not cache previously
  opened exercises; opening A → B → A re-fetches A. Acceptable given typical
  session sizes (8–12 items) and the loader's small payload, but worth
  noting if performance becomes an issue.
- The two-column split only kicks in at `lg` (≥ 1024px). On tablets in
  portrait the panel stacks below the list, which is functional but a step
  down from the desktop experience.

### Neutral / follow-ups

- Consider keyboard navigation between previews (next / previous exercise)
  if usage data shows people stepping through exercises sequentially.
- If the markdown bundle continues to grow, consider a lighter renderer for
  the preview-only path; we don't need the full editor surface here.
- The "preview while editing a session" flow is _not_ covered — this ADR is
  scoped to the read-only detail page.

## References

- Spec: `docs/prompts/practise session view improvements.md`
- PR: [#53 feat/exercise-preview-panel](https://github.com/janimattiellonen/Harkkapankki/pull/53)
- Commit: `ca8c363` — "Add side-panel exercise preview to practise session detail"
- Files: `app/components/ExercisePreviewPanel.tsx`, `app/pages/PractiseSessionDetail.tsx`
