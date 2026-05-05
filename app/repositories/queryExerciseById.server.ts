import { db } from '~/utils/db.server';

export function queryExerciseById(id: string) {
  return db.exercise.findUnique({
    where: { id },
  });
}
