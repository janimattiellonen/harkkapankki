import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import ExercisesListPage from '~/pages/ExercisesListPage';
import { fetchExercises, type ExerciseFilters } from '~/services/exercises.server';
import { fetchExerciseTypeOptions } from '~/services/exerciseTypes.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('q') || undefined;
  const typeIds = url.searchParams.get('types')?.split(',').filter(Boolean) || undefined;

  const filters: ExerciseFilters = {
    searchTerm,
    exerciseTypeIds: typeIds,
  };

  const [exercises, exerciseTypes] = await Promise.all([
    fetchExercises('en', filters),
    fetchExerciseTypeOptions('en', 'exercise-form'),
  ]);

  return json({ exercises, exerciseTypes });
};

export default function Exercises() {
  const { exercises, exerciseTypes } = useLoaderData<typeof loader>();
  return <ExercisesListPage exercises={exercises} exerciseTypes={exerciseTypes} />;
}
