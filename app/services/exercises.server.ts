import type { Exercise } from '@prisma/client';
import { queryExercises, type ExerciseWhereInput } from '~/repositories/queryExercises.server';
import { queryExerciseById } from '~/repositories/queryExerciseById.server';
import { queryExerciseBySlug } from '~/repositories/queryExerciseBySlug.server';
import { queryExercisesBySlugPrefix } from '~/repositories/queryExercisesBySlugPrefix.server';
import { queryCreateExercise } from '~/repositories/queryCreateExercise.server';
import { queryUpdateExercise } from '~/repositories/queryUpdateExercise.server';
import { queryDeleteExercise } from '~/repositories/queryDeleteExercise.server';
import { fetchExerciseTypePath } from './exerciseTypes.server';
import { slugify, makeUniqueSlug } from '~/utils/slugify';
import { getDefaultLocale } from '~/utils/locale.server';

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

export async function fetchExercises(
  language: string = getDefaultLocale(),
  filters?: ExerciseFilters
): Promise<ExerciseWithTypePath[]> {
  const where: ExerciseWhereInput = {};

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

  const exercises = await queryExercises(where);

  // Fetch exercise type paths for all exercises
  const exercisesWithPaths = await Promise.all(
    exercises.map(async exercise => {
      const exerciseTypePath = await fetchExerciseTypePath(exercise.exerciseTypeId, language);
      return {
        ...exercise,
        exerciseTypePath: exerciseTypePath?.translatedPath || null,
      };
    })
  );

  return exercisesWithPaths;
}

export async function fetchExerciseById(
  id: string,
  language: string = getDefaultLocale()
): Promise<ExerciseWithTypePath | null> {
  const exercise = await queryExerciseById(id);

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

export async function fetchExerciseBySlug(
  slug: string,
  language: string = getDefaultLocale()
): Promise<ExerciseWithTypePath | null> {
  const exercise = await queryExerciseBySlug(slug);

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

  // Generate slug from name
  const baseSlug = slugify(data.name);

  // Check for existing slugs to ensure uniqueness
  const existingSlugs = await queryExercisesBySlugPrefix(baseSlug);
  const existingSlugStrings = existingSlugs.map(e => e.slug);
  const uniqueSlug = makeUniqueSlug(baseSlug, existingSlugStrings);

  return queryCreateExercise({
    ...rest,
    slug: uniqueSlug,
    duration: Number(rest.duration),
    exerciseType: {
      connect: { id: exerciseTypeId },
    },
  });
}

export async function updateExercise(id: string, data: ExerciseInput): Promise<Exercise> {
  const { exerciseTypeId, ...rest } = data;

  // Get the current exercise to check if name changed
  const currentExercise = await queryExerciseById(id);

  if (!currentExercise) {
    throw new Error('Exercise not found');
  }

  // If name changed, regenerate slug
  let slug: string | undefined;
  if (currentExercise.name !== data.name) {
    const baseSlug = slugify(data.name);
    const existingSlugs = await queryExercisesBySlugPrefix(baseSlug);
    // Filter out the current exercise's slug from the existing slugs
    const existingSlugStrings = existingSlugs
      .filter(e => e.slug !== currentExercise.slug)
      .map(e => e.slug);
    slug = makeUniqueSlug(baseSlug, existingSlugStrings);
  }

  return queryUpdateExercise(id, {
    ...rest,
    ...(slug && { slug }),
    duration: Number(rest.duration),
    exerciseType: {
      connect: { id: exerciseTypeId },
    },
  });
}

export async function deleteExercise(id: string): Promise<Exercise> {
  return queryDeleteExercise(id);
}
