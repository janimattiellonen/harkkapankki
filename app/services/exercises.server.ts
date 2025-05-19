import { db } from "~/utils/db.server";
import type { Exercise } from "@prisma/client";
import { fetchExerciseTypePath } from "./exerciseTypes.server";

export type ExerciseInput = {
  name: string;
  description?: string | null;
  content: string;
  youtubeVideo?: string | null;
  duration: number;
  exerciseTypeId: string;
};

export type ExerciseWithTypePath = Exercise & {
  exerciseTypePath: string | null;
};

export async function fetchExercises(): Promise<Exercise[]> {
  return db.exercise.findMany({
    orderBy: { name: "asc" },
  });
}

export async function fetchExerciseById(id: string, language: string = 'en'): Promise<ExerciseWithTypePath | null> {
  const exercise = await db.exercise.findUnique({
    where: { id },
  });

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
  return db.exercise.create({
    data: {
      ...data,
      duration: Number(data.duration),
    },
  });
}

export async function updateExercise(id: string, data: ExerciseInput): Promise<Exercise> {
  return db.exercise.update({
    where: { id },
    data: {
      ...data,
      duration: Number(data.duration),
    },
  });
}