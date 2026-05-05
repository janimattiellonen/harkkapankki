type EligibleType = {
  id: string;
  exerciseIds: string[];
};

type GeneratorSection = {
  id: string;
  order: number;
  eligibleTypes: EligibleType[];
};

export type GenerateProgrammeInput = {
  sections: GeneratorSection[];
  rowCount: number;
  rng?: () => number;
};

export type GeneratedItem = {
  sectionId: string;
  exerciseTypeId: string;
  exerciseId: string | null;
  order: number;
};

export type GeneratorWarning = {
  rowIndex: number;
  sectionId: string;
  reason: 'no-fresh-drill' | 'no-eligible-types';
};

export type GenerateProgrammeOutput = {
  sessions: Array<{ items: GeneratedItem[] }>;
  warnings: GeneratorWarning[];
};

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateProgrammeForBatch({
  sections,
  rowCount,
  rng = Math.random,
}: GenerateProgrammeInput): GenerateProgrammeOutput {
  const sessions: Array<{ items: GeneratedItem[] }> = [];
  const warnings: GeneratorWarning[] = [];

  for (let i = 0; i < rowCount; i++) {
    const excluded = new Set<string>();
    for (let j = Math.max(0, i - 2); j < i; j++) {
      for (const item of sessions[j].items) {
        if (item.exerciseId) {
          excluded.add(item.exerciseId);
        }
      }
    }

    const items: GeneratedItem[] = [];

    for (const section of sections) {
      if (section.eligibleTypes.length === 0) {
        warnings.push({ rowIndex: i, sectionId: section.id, reason: 'no-eligible-types' });
        continue;
      }

      const shuffledTypes = shuffle(section.eligibleTypes, rng);
      let picked: { typeId: string; exerciseId: string } | null = null;

      for (const type of shuffledTypes) {
        if (type.exerciseIds.length === 0) {
          continue;
        }
        const shuffledExercises = shuffle(type.exerciseIds, rng);
        for (const exerciseId of shuffledExercises) {
          if (!excluded.has(exerciseId)) {
            picked = { typeId: type.id, exerciseId };
            break;
          }
        }
        if (picked) {
          break;
        }
      }

      if (picked) {
        items.push({
          sectionId: section.id,
          exerciseTypeId: picked.typeId,
          exerciseId: picked.exerciseId,
          order: section.order,
        });
      } else {
        items.push({
          sectionId: section.id,
          exerciseTypeId: shuffledTypes[0].id,
          exerciseId: null,
          order: section.order,
        });
        warnings.push({ rowIndex: i, sectionId: section.id, reason: 'no-fresh-drill' });
      }
    }

    sessions.push({ items });
  }

  return { sessions, warnings };
}
