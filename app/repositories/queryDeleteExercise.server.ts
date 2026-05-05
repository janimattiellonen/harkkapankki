import type { Exercise } from '@prisma/client';
import { db } from '~/utils/db.server';

export function queryDeleteExercise(id: string): Promise<Exercise> {
  return db.exercise.delete({
    where: { id },
  });
}
