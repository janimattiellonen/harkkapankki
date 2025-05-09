import { db } from "~/utils/db.server";
import type { Exercise } from "@prisma/client";

export async function fetchExercises(): Promise<Exercise[]> {
  return db.exercise.findMany({
    orderBy: { name: "asc" },
  });
}

export async function fetchExerciseById(id: string): Promise<Exercise | null> {
  return db.exercise.findUnique({
    where: { id },
  });
}