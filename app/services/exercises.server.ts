import type { Exercise } from "@prisma/client";
import * as exerciseRepo from "~/repositories/exercise.server";
import { fetchExerciseTypePath } from "./exerciseTypes.server";

export type ExerciseInput = {
  name: string;
  description?: string | null;
  content: string;
  image?: string | null;
  youtubeVideo?: string | null;
  duration: number;
  exerciseTypeId: string;
};

export type ExerciseWithTypePath = Exercise & {
  exerciseTypePath: string | null;
};

export type ExerciseFilters = {
  searchTerm?: string;
  exerciseTypeIds?: string[];
};

export async function fetchExercises(language: string = 'en', filters?: ExerciseFilters): Promise<ExerciseWithTypePath[]> {
  const where: exerciseRepo.ExerciseWhereInput = {};

  // Apply search term filter
  if (filters?.searchTerm && filters.searchTerm.length >= 3) {
    where.name = {
      contains: filters.searchTerm,
      mode: 'insensitive',
    };
  }

  // Apply exercise type filter
  if (filters?.exerciseTypeIds && filters.exerciseTypeIds.length > 0) {
    where.exerciseTypeId = {
      in: filters.exerciseTypeIds,
    };
  }

  const exercises = await exerciseRepo.findManyExercises(where);

  // Fetch exercise type paths for all exercises
  const exercisesWithPaths = await Promise.all(
    exercises.map(async (exercise) => {
      const exerciseTypePath = await fetchExerciseTypePath(exercise.exerciseTypeId, language);
      return {
        ...exercise,
        exerciseTypePath: exerciseTypePath?.translatedPath || null,
      };
    })
  );

  return exercisesWithPaths;
}

export async function fetchExerciseById(id: string, language: string = 'en'): Promise<ExerciseWithTypePath | null> {
  const exercise = await exerciseRepo.findExerciseById(id);

  if (!exercise) {
    return null;
  }

  // Fetch the exercise type path
  const exerciseTypePath = await fetchExerciseTypePath(exercise.exerciseTypeId, language);

  return {
    ...exercise,
    exerciseTypePath: exerciseTypePath?.translatedPath || null,
  };
}

export async function createExercise(data: ExerciseInput): Promise<Exercise> {
  const { exerciseTypeId, ...rest } = data;

  return exerciseRepo.createExercise({
    ...rest,
    duration: Number(rest.duration),
    exerciseType: {
      connect: { id: exerciseTypeId },
    },
  });
}

export async function updateExercise(id: string, data: ExerciseInput): Promise<Exercise> {
  const { exerciseTypeId, ...rest } = data;

  return exerciseRepo.updateExercise(id, {
    ...rest,
    duration: Number(rest.duration),
    exerciseType: {
      connect: { id: exerciseTypeId },
    },
  });
}