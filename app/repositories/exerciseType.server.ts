import { db } from "~/utils/db.server";

export function findExerciseTypeWithHierarchy(exerciseTypeId: string, language: string) {
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

export function findRootExerciseTypesWithChildren(language: string) {
  return db.exerciseType.findMany({
    where: {
      parentId: null,
    },
    include: {
      translations: {
        where: { language },
        select: { name: true },
      },
      children: {
        include: {
          translations: {
            where: { language },
            select: { name: true },
          },
        },
      },
    },
    orderBy: {
      slug: 'asc',
    },
  });
}
