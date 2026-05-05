import {
  redirect,
  type ActionFunctionArgs,
  type MetaFunction,
  type LoaderFunctionArgs,
} from 'react-router';
import { useLoaderData } from 'react-router';
import PractiseSessionForm from '~/pages/PractiseSessionForm';
import { fetchSectionsForPractiseSession } from '~/services/sections.server';
import { createPracticeSession } from '~/services/practiceSessions.server';
import { fetchSeasonById } from '~/services/seasons.server';
import type { SelectedItem } from '~/types';
import { getDefaultLocale } from '~/utils/locale.server';
import { helsinkiWallClockToUtc } from '~/utils/timezone';

export const meta: MetaFunction = () => {
  return [{ title: 'Design Practice Session - Harkkapankki' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const seasonId = url.searchParams.get('seasonId');

  const [sections, season] = await Promise.all([
    fetchSectionsForPractiseSession(getDefaultLocale()),
    seasonId ? fetchSeasonById(seasonId) : Promise.resolve(null),
  ]);

  return { sections, season };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const sessionLength = parseInt(formData.get('sessionLength') as string, 10);
  const selectedItemsJson = formData.get('selectedItems') as string;
  const selectedItems: SelectedItem[] = JSON.parse(selectedItemsJson);
  const seasonId = (formData.get('seasonId') as string | null) || null;
  const scheduledDate = (formData.get('scheduledDate') as string | null) || '';
  const scheduledTime = (formData.get('scheduledTime') as string | null) || '';

  const scheduledAt =
    scheduledDate && scheduledTime ? helsinkiWallClockToUtc(scheduledDate, scheduledTime) : null;

  const session = await createPracticeSession({
    name: name || undefined,
    description: description || undefined,
    sessionLength,
    seasonId,
    scheduledAt,
    selectedItems,
  });

  if (seasonId) {
    const season = await fetchSeasonById(seasonId);
    if (season) {
      return redirect(`/seasons/${season.slug}`);
    }
  }

  return redirect(`/practise-sessions/${session.slug}`);
}

export default function NewPractiseSession() {
  const { sections, season } = useLoaderData<typeof loader>();
  return (
    <PractiseSessionForm
      sections={sections}
      seasonBadge={season ? { slug: season.slug, name: season.name } : undefined}
      hiddenSeasonId={season?.id}
    />
  );
}
