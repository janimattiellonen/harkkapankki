import { db } from '~/utils/db.server';

export async function queryExercisesBySlugPrefix(prefix: string) {
  return db.exercise.findMany({
    where: {
      slug: {
        startsWith: prefix,
      },
    },
    select: {
      slug: true,
    },
  });
}
