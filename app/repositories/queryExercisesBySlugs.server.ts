import { db } from '~/utils/db.server';

export async function queryExercisesBySlugs(slugs: string[]) {
  return db.exercise.findMany({
    where: {
      slug: {
        in: slugs,
      },
    },
    select: {
      slug: true,
    },
  });
}
