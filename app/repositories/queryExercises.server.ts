import { db } from '~/utils/db.server';

export type ExerciseWhereInput = {
  name?: { contains: string; mode: 'insensitive' };
  exerciseTypeId?: { in: string[] };
};

export function queryExercises(where: ExerciseWhereInput) {
  return db.exercise.findMany({
    where,
    orderBy: { name: 'asc' },
  });
}
