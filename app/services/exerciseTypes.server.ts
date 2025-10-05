import * as exerciseTypeRepo from "~/repositories/exerciseType.server";
import type { ExerciseTypeOption } from "~/types";

type ExerciseTypeWithPath = {
  id: string;
  slug: string;
  translatedPath: string;
};

export async function fetchExerciseTypePath(exerciseTypeId: string, language: string): Promise<ExerciseTypeWithPath | null> {
  const exerciseType = await exerciseTypeRepo.findExerciseTypeWithHierarchy(exerciseTypeId, language);

  if (!exerciseType) {
    return null;
  }

  // Build the path string
  const pathParts: string[] = [];

  // Add grandparent if exists
  if (exerciseType.parent?.parent) {
    const grandparentName = exerciseType.parent.parent.translations[0]?.name;
    if (grandparentName) {
      pathParts.push(grandparentName);
    }
  }

  // Add parent if exists
  if (exerciseType.parent) {
    const parentName = exerciseType.parent.translations[0]?.name;
    if (parentName) {
      pathParts.push(parentName);
    }
  }

  // Add current type
  const currentName = exerciseType.translations[0]?.name;
  if (currentName) {
    pathParts.push(currentName);
  }

  return {
    id: exerciseType.id,
    slug: exerciseType.slug,
    translatedPath: pathParts.join(" / "),
  };
}

export async function fetchExerciseTypeOptions(language: string = 'en', groupSlug?: string): Promise<ExerciseTypeOption[]> {
  const types = await exerciseTypeRepo.findRootExerciseTypesWithChildren(language, groupSlug);

  return types.map(type => ({
    id: type.id,
    name: type.translations[0]?.name || type.slug,
    slug: type.slug,
    children: type.children
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map(child => ({
        id: child.id,
        name: child.translations[0]?.name || child.slug,
        slug: child.slug,
      })),
  }));
}