import type { MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import SeasonsList from '~/pages/SeasonsList';
import { fetchSeasons } from '~/services/seasons.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Seasons - Harkkapankki' }];
};

export async function loader() {
  const seasons = await fetchSeasons();
  return { seasons };
}

export default function SeasonsIndex() {
  const { seasons } = useLoaderData<typeof loader>();
  return <SeasonsList seasons={seasons} />;
}
