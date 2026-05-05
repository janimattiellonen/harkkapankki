import { db } from '~/utils/db.server';

export function queryExerciseBySlug(slug: string) {
  return db.exercise.findUnique({
    where: { slug },
  });
}
