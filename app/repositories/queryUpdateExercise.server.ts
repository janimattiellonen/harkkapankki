import type { Exercise } from '@prisma/client';
import { db } from '~/utils/db.server';

export type UpdateExerciseData = {
  slug?: string;
  name: string;
  description?: string | null;
  content: string;
  image?: string | null;
  youtubeVideo?: string | null;
  duration: number;
  exerciseType: {
    connect: { id: string };
  };
};

export function queryUpdateExercise(id: string, data: UpdateExerciseData): Promise<Exercise> {
  return db.exercise.update({
    where: { id },
    data,
  });
}
