import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import ExercisesListPage from '~/pages/ExercisesListPage';
import { fetchExercises, type ExerciseFilters } from '~/services/exercises.server';
import { fetchExerciseTypeOptions } from '~/services/exerciseTypes.server';
import { getDefaultLocale } from '~/utils/locale.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('q') || undefined;
  const typeIds = url.searchParams.get('types')?.split(',').filter(Boolean) || undefined;
  const deleted = url.searchParams.get('deleted') === 'true';

  const filters: ExerciseFilters = {
    searchTerm,
    exerciseTypeIds: typeIds,
  };

  const [exercises, exerciseTypes] = await Promise.all([
    fetchExercises(getDefaultLocale(), filters),
    fetchExerciseTypeOptions(getDefaultLocale(), 'exercise-form'),
  ]);

  return json({ exercises, exerciseTypes, deleted });
};

export default function Exercises() {
  const { exercises, exerciseTypes, deleted } = useLoaderData<typeof loader>();
  return (
    <ExercisesListPage exercises={exercises} exerciseTypes={exerciseTypes} deleted={deleted} />
  );
}
