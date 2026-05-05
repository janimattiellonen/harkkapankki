import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import { useLoaderData } from 'react-router';
import SeasonDetailPage from '~/pages/SeasonDetailPage';
import { deleteSeason, fetchSeasonBySlug, fetchSeasonHints } from '~/services/seasons.server';
import { getDefaultLocale } from '~/utils/locale.server';

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData?.season) {
    return [{ title: 'Season Not Found - Harkkapankki' }];
  }
  return [{ title: `${loaderData.season.name} - Harkkapankki` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const [season, hints] = await Promise.all([
    fetchSeasonBySlug(params.slug!),
    fetchSeasonHints(params.slug!, getDefaultLocale()),
  ]);
  if (!season) {
    throw new Response('Season not found', { status: 404 });
  }
  return { season, hints };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'delete') {
    const season = await fetchSeasonBySlug(params.slug!);
    if (!season) {
      throw new Response('Season not found', { status: 404 });
    }
    try {
      await deleteSeason(season.id);
      return redirect('/seasons');
    } catch {
      return data(
        {
          success: false,
          message: 'Failed to delete season. Please try again.',
        },
        { status: 500 }
      );
    }
  }

  return data({ success: false, message: 'Unknown action.' }, { status: 400 });
}

export default function SeasonDetailRoute() {
  const { season, hints } = useLoaderData<typeof loader>();
  return <SeasonDetailPage season={season} hints={hints} />;
}
