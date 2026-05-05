# Phase 4 — progression-aware auto-generation: scoping

**Status:** scoping. No code yet. This doc explores design choices and recommends a path. Treat the recommendations as a first draft, not a decision.

## Why this phase exists

Per `docs/18 - season planning feature plan.md`, Phase 4 is the season-planning feature's north star:

> The system proposes a full season plan that introduces and builds on techniques in a sensible order.

Phase 1's auto-gen is a deliberately dumb baseline: it picks one drill per section per session with a rolling 2-row exclusion to avoid immediate repeats. It has no concept of order — "putting from 5m" might be scheduled before "grip and stance" because there's nothing telling the picker the latter has to come first.

Phase 4 layers pedagogical sequencing on top: the picker introduces techniques in a coach-curated order, then begins reinforcing the earlier ones once everything has been introduced.

## What "progression" means here

Three plausible interpretations of "sensible order":

1. **Prerequisites graph.** Each technique declares which techniques must be taught first (e.g., "backhand putting" requires "grip and stance"). The picker walks the graph, only scheduling a technique once its prerequisites are satisfied.
2. **Difficulty levels.** Each technique has a 1–5 score. The picker schedules low-difficulty first, ramps up.
3. **Coach-curated curriculum.** For each fixed section, the coach defines an ordered list of techniques representing the desired teaching sequence. The picker walks that list.

### Recommendation: option 3 (coach-curated curriculum)

**Why:**

- Real authoring time is a hard constraint here — the author runs the sessions himself. Option 3 has the simplest data-entry UX (drag to reorder) and no graph to maintain.
- The exercise bank is sparse. A strict prerequisite graph (option 1) starves the picker when prerequisites have no drills yet. Difficulty levels (option 2) are fuzzy and hard to set well.
- "Sensible order" maps cleanly onto an ordered list. A curriculum is the model coaches already use mentally.
- Promotable later: if option 1 or 2 turns out to be needed, the curriculum is a strict subset of either and can be regenerated from them.

**What we lose vs. option 1:** strict invariants. A coach can manually schedule something out of order via `/practise-sessions/$id/edit`, and the system won't catch it. That's already true today and is consistent with the "warn, don't enforce" tone of Phase 3 hints.

## Algorithm shape

Two options:

- **Replace** Phase 1's `generateProgrammeForBatch` with a progression-aware variant.
- **Layer** the new picker on top with a toggle (per season, or per add-sessions batch).

### Recommendation: layer with a per-batch toggle

**Why:**

- Phase 1 is shipped, simple, and already battle-tested on the author's own seasons. Don't throw it away.
- A coach planning a "revision week" or filling gaps mid-season may want the dumb random pick rather than progression-driven order. The toggle preserves that escape hatch.
- Lower-risk rollout. If progression behaves badly on the sparse bank, the dumb path still works.

The toggle lives on the add-sessions form: a checkbox/segment "Algoritmi: peruslogiikka / etenemisjärjestys". Default to progression once it's stable; default to plain initially.

## Coverage / fallback strategy

When the progression picker can't satisfy a section:

- The next un-introduced technique in the curriculum has zero exercises in the bank → fall back to Phase 1's "pick any other type with a drill" within that section.
- The curriculum is exhausted (everything has been introduced) → switch to **reinforcement mode**: pick a previously-introduced technique, weighted toward the one not seen in the longest. This dovetails with Phase 3's "stale type" hint.
- The curriculum is empty for this section → fall back to Phase 1 entirely for that section. Emit a hint suggesting the coach add a curriculum.

Each fallback emits a warning consumed by the same query-param banner Phase 1's auto-gen already uses.

## Schema sketch (recommended path)

Minimum viable change: add ordering to the existing `SectionExerciseType` join table.

```prisma
model SectionExerciseType {
  id             String       @id @default(uuid())
  section        Section      @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId      String       @map("section_id")
  exerciseType   ExerciseType @relation(fields: [exerciseTypeId], references: [id], onDelete: Cascade)
  exerciseTypeId String       @map("exercise_type_id")
  position       Int          @default(0)        // NEW: lower = introduce earlier
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  @@unique([sectionId, exerciseTypeId])
  @@index([sectionId, position])                  // NEW
  @@index([sectionId])
  @@index([exerciseTypeId])
  @@map("section_exercise_types")
}
```

`position` is global (not per-season) for the MVP. Per-season curricula can be added later via a separate `SeasonCurriculum` model that overrides positions for a specific season; out of scope here.

## Algorithm pseudocode

```
generateProgressionForBatch(rows, curriculum, alreadyIntroducedBySection, rng):
  introduced = clone(alreadyIntroducedBySection)  # Map<sectionId, Set<typeId>>
  newSessions = []

  for i in 0..rows.length:
    row = rows[i]
    excludedExerciseIds = collect specific Exercise IDs from
                          newSessions[max(0, i-2)..i-1]
    items = []

    for section in seasonSections:
      sequence = curriculum[section.id]  # ordered by position asc

      if sequence is empty:
        # No curriculum: fall back to Phase 1 picker for this section
        item = phase1Pick(section, excluded, rng)
        emitWarning(rowIndex: i, sectionId: section.id, reason: "no-curriculum")

      else:
        # Try introducing the next un-introduced type
        nextType = first(t in sequence where t.id not in introduced[section.id])

        if nextType:
          chosenType = nextType
        else:
          # All introduced — reinforcement mode: pick a previously-introduced type,
          # prefer the one with the largest gap since last appearance.
          chosenType = pickReinforcement(introduced[section.id], history, rng)

        # Pick a specific exercise within the type (rolling 2-row exclusion)
        pickedExercise = first(ex in chosenType.exercises where ex.id not in excludedExerciseIds)

        if pickedExercise:
          items.push({ section, type: chosenType, exerciseId: pickedExercise.id, order: section.order })
        else:
          items.push({ section, type: chosenType, exerciseId: null, order: section.order })
          emitWarning(rowIndex: i, sectionId: section.id, reason: "no-fresh-drill")

        introduced[section.id].add(chosenType.id)

      items.push(item)

    newSessions.push({ session: row, items })

  return { sessions: newSessions, warnings, finalIntroducedState: introduced }
```

The function is **pure** for unit testing, just like Phase 1's. The `alreadyIntroducedBySection` input lets it work correctly across multiple batches: when a coach adds five sessions, then five more later, the second batch picks up where the first left off.

## Cross-batch state: how to derive `alreadyIntroducedBySection`

Before running the picker, walk the season's existing `PracticeSession.sectionItems`:

```
for each existing session in the season (ordered by scheduledAt):
  for each item in session.sectionItems:
    introduced[item.sectionId].add(item.exerciseTypeId)
```

No new schema needed — derive from existing data each time the picker runs.

## Open questions

1. **Curriculum admin UI.** Where does the coach edit `position`? Options: (a) inline on a section detail page (no such page exists yet), (b) a dedicated `/admin/curriculum` page, (c) defer the UI and seed via SQL/Prisma seed initially. Recommendation: (c) for the schema-migration PR, (a) or (b) in a follow-up.
2. **Reinforcement weighting.** Once everything is introduced, how to pick? Options: random, largest-gap-since-last-seen, "weakest" by some manual coach annotation. Recommendation: largest-gap-since-last-seen — naturally surfaces stale types and dovetails with Phase 3 hints.
3. **Edit-and-replace semantics.** If a coach manually edits a generated session's section item to a different type, does that count as "introduced" for the next batch? Recommendation: yes — derive purely from data, not from algorithm state. Manual edits are first-class.
4. **What if `position` collides?** Multiple types with the same `position` in a section: pick deterministic by `slug` ascending so the order is stable. Worth documenting.
5. **Coverage page integration.** Should the coverage page show "curriculum position 7 of 10"? Probably yes — it's the most natural place to show progression status. Out of scope for this scoping doc; included in the suggested PR sequence below.
6. **Default `position` after the migration.** All existing rows get `position = 0`, which means "all introduced together". The picker should treat all-zero as "no order specified" → fall back to Phase 1 for that section, with the no-curriculum warning. Coach then sets meaningful positions when ready.

## Suggested PR sequence

1. **PR — Schema migration.** Add `position Int @default(0)` to `SectionExerciseType` plus the composite index. No app code beyond regenerated Prisma types. Cross-PR: update the seeder so new dev DBs get a sensible default ordering.
2. **PR — Progression picker + unit tests.** New `app/services/sessionProgressionGenerator.server.ts`. Pure function. Tests cover: introduction order, reinforcement after exhaustion, multi-batch state continuity, no-curriculum fallback, type-only fallback, deterministic under seeded RNG.
3. **PR — Wire into add-sessions.** Per-batch toggle on the form (default: plain). Action picks the appropriate picker, computes `alreadyIntroducedBySection` from existing sessions, runs picker, writes atomically. Same warnings banner as Phase 1.
4. **PR — Coverage curriculum view.** Show "introduced" vs "not yet introduced" types per section on `/seasons/$slug/coverage`. Includes "curriculum position N of M" if the section has any positions set.
5. **PR — Curriculum admin UI.** Drag-to-reorder positions per section. Could be deferred indefinitely if SQL seeding is enough for the author's own use; matters more for the eventual junnufriba handover.

PR 5 is the only one that's "junnufriba prerequisite" — PRs 1–4 are sufficient for the author's personal use with curriculum seeded via SQL.

## Risks and tradeoffs

- **Risk:** the recommended schema doesn't capture per-season curricula. If the author runs two parallel groups (e.g., beginners + advanced) on different curricula, the global `position` won't suffice. Mitigation: add a `SeasonCurriculum` overlay model later. Doesn't break any of PRs 1–4.
- **Risk:** the dumb baseline becomes the unfamiliar branch and rots. Mitigation: keep at least one unit test exercising it; consider deleting Phase 1's picker in a future cleanup once Phase 4 is the daily driver.
- **Tradeoff:** authoring `position` values is a prerequisite for the picker to do anything useful. Until the coach sets them, the system silently behaves like Phase 1 (with a hint). That's a soft launch, which is the point.

## What's deliberately not in this doc

- Multi-coach / multi-tenant concerns. Out of scope per `docs/18` ("Phase 1 is for solo use"); will be revisited if junnufriba adopts the project.
- Bank coverage improvements (more exercises). Orthogonal — Phase 4 surfaces gaps but doesn't fill them.
- Time-of-year awareness ("plan more outdoor drills in summer"). Out of scope; could be a Phase 5 idea.
