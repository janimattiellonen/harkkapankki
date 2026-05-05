import type { Exercise } from '@prisma/client';
import { db } from '~/utils/db.server';

export type CreateExerciseData = {
  slug: string;
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

export function queryCreateExercise(data: CreateExerciseData): Promise<Exercise> {
  return db.exercise.create({
    data,
  });
}
