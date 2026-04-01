import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import ExerciseDetailPage from '~/pages/ExerciseDetailPage';
import { fetchExerciseBySlug } from '~/services/exercises.server';
import { getDefaultLocale } from '~/utils/locale.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const exercise = await fetchExerciseBySlug(params.slug!, getDefaultLocale());

  if (!exercise) {
    throw new Response('Exercise not found', { status: 404 });
  }

  return { exercise };
}

export default function ExerciseDetail() {
  const { exercise } = useLoaderData<typeof loader>();
  return <ExerciseDetailPage exercise={exercise} />;
}
