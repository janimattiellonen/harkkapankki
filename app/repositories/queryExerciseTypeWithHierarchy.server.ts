import { db } from '~/utils/db.server';

export function queryExerciseTypeWithHierarchy(exerciseTypeId: string, language: string) {
  return db.exerciseType.findUnique({
    where: { id: exerciseTypeId },
    include: {
      translations: {
        where: { language },
        select: { name: true },
      },
      parent: {
        include: {
          translations: {
            where: { language },
            select: { name: true },
          },
          parent: {
            include: {
              translations: {
                where: { language },
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });
}
