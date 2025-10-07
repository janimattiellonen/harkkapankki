import { db } from '~/utils/db.server';
import type { Exercise } from '@prisma/client';

export type ExerciseWhereInput = {
  name?: { contains: string; mode: 'insensitive' };
  exerciseTypeId?: { in: string[] };
};

export function findManyExercises(where: ExerciseWhereInput) {
  return db.exercise.findMany({
    where,
    orderBy: { name: 'asc' },
  });
}

export function findExerciseById(id: string) {
  return db.exercise.findUnique({
    where: { id },
  });
}

export function findExerciseBySlug(slug: string) {
  return db.exercise.findUnique({
    where: { slug },
  });
}

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

export function createExercise(data: CreateExerciseData): Promise<Exercise> {
  return db.exercise.create({
    data,
  });
}

export async function findExercisesBySlugs(slugs: string[]) {
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

export function updateExercise(id: string, data: UpdateExerciseData): Promise<Exercise> {
  return db.exercise.update({
    where: { id },
    data,
  });
}
