type SectionItemInput = {
  sectionId: string;
  exerciseTypeId: string;
  exerciseId: string | null;
  typeName: string;
  exerciseName: string | null;
};

type SessionInput = {
  id: string;
  slug: string;
  scheduledAt: Date | null;
  sectionItems: SectionItemInput[];
};

type SectionInput = {
  id: string;
  name: string;
  eligibleTypeIds: string[];
};

export type ComputeHintsInput = {
  sessions: SessionInput[];
  sections: SectionInput[];
};

export type StaleTypeHint = {
  typeId: string;
  typeName: string;
  sessionsSinceLastUse: number;
};

export type RecentRepeatHint = {
  exerciseId: string;
  exerciseName: string;
  earlierSessionSlug: string;
  laterSessionSlug: string;
  gap: number;
};

export type LowDiversitySectionHint = {
  sectionId: string;
  sectionName: string;
  uniqueTypeName: string;
  sessionsInSection: number;
};

export type SeasonHints = {
  staleTypes: StaleTypeHint[];
  recentRepeats: RecentRepeatHint[];
  lowDiversitySections: LowDiversitySectionHint[];
};

export const STALE_WINDOW = 3;
export const REPEAT_WINDOW = 2;
export const LOW_DIVERSITY_MIN_SESSIONS = 3;

export function computeSeasonHints({ sessions, sections }: ComputeHintsInput): SeasonHints {
  const totalSessions = sessions.length;

  const staleTypes: StaleTypeHint[] = [];
  if (totalSessions > STALE_WINDOW) {
    const eligibleTypeIds = new Set<string>();
    for (const section of sections) {
      for (const id of section.eligibleTypeIds) {
        eligibleTypeIds.add(id);
      }
    }

    const lastUseIndexByType = new Map<string, { index: number; name: string }>();
    sessions.forEach((session, index) => {
      for (const item of session.sectionItems) {
        if (!eligibleTypeIds.has(item.exerciseTypeId)) {
          continue;
        }
        lastUseIndexByType.set(item.exerciseTypeId, { index, name: item.typeName });
      }
    });

    const lastIndex = totalSessions - 1;
    for (const [typeId, { index, name }] of lastUseIndexByType.entries()) {
      const gap = lastIndex - index;
      if (gap >= STALE_WINDOW) {
        staleTypes.push({ typeId, typeName: name, sessionsSinceLastUse: gap });
      }
    }
    staleTypes.sort((a, b) => b.sessionsSinceLastUse - a.sessionsSinceLastUse);
  }

  const recentRepeats: RecentRepeatHint[] = [];
  type Seen = { sessionIndex: number; sessionSlug: string; exerciseName: string };
  const seenByExercise = new Map<string, Seen>();
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    for (const item of session.sectionItems) {
      if (item.exerciseId === null || item.exerciseName === null) {
        continue;
      }
      const previous = seenByExercise.get(item.exerciseId);
      if (previous) {
        const gap = i - previous.sessionIndex;
        if (gap > 0 && gap <= REPEAT_WINDOW) {
          recentRepeats.push({
            exerciseId: item.exerciseId,
            exerciseName: item.exerciseName,
            earlierSessionSlug: previous.sessionSlug,
            laterSessionSlug: session.slug,
            gap,
          });
        }
      }
      seenByExercise.set(item.exerciseId, {
        sessionIndex: i,
        sessionSlug: session.slug,
        exerciseName: item.exerciseName,
      });
    }
  }

  const lowDiversitySections: LowDiversitySectionHint[] = [];
  for (const section of sections) {
    if (section.eligibleTypeIds.length < 2) {
      continue;
    }

    const typesUsedInSection = new Map<string, string>();
    let sessionsInSection = 0;
    for (const session of sessions) {
      const itemsHere = session.sectionItems.filter(item => item.sectionId === section.id);
      if (itemsHere.length === 0) {
        continue;
      }
      sessionsInSection += 1;
      for (const item of itemsHere) {
        if (!typesUsedInSection.has(item.exerciseTypeId)) {
          typesUsedInSection.set(item.exerciseTypeId, item.typeName);
        }
      }
    }

    if (sessionsInSection < LOW_DIVERSITY_MIN_SESSIONS) {
      continue;
    }

    if (typesUsedInSection.size === 1) {
      const [uniqueTypeName] = typesUsedInSection.values();
      lowDiversitySections.push({
        sectionId: section.id,
        sectionName: section.name,
        uniqueTypeName,
        sessionsInSection,
      });
    }
  }

  return { staleTypes, recentRepeats, lowDiversitySections };
}
