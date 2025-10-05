import { db } from './db-setup';
import type { ExerciseType } from '@prisma/client';

/**
 * Factory function to create an exercise type with translations
 */
export async function createExerciseType(
  slug: string,
  translations: { fi: string; en: string },
  parentId?: string
): Promise<ExerciseType> {
  const exerciseType = await db.exerciseType.create({
    data: {
      slug,
      parentId,
    },
  });

  await db.exerciseTypeTranslation.createMany({
    data: [
      { exerciseTypeId: exerciseType.id, language: 'fi', name: translations.fi },
      { exerciseTypeId: exerciseType.id, language: 'en', name: translations.en },
    ],
  });

  return exerciseType;
}

/**
 * Quick setup for common test scenario: create basic exercise type hierarchy
 */
export async function setupBasicExerciseTypes() {
  const technique = await createExerciseType(
    'technique',
    { fi: 'Tekniikka', en: 'Technique' }
  );

  const putting = await createExerciseType(
    'putting',
    { fi: 'Puttaaminen', en: 'Putting' },
    technique.id
  );

  const backhand = await createExerciseType(
    'backhand',
    { fi: 'Rystyheitto', en: 'Backhand' },
    technique.id
  );

  return { technique, putting, backhand };
}
