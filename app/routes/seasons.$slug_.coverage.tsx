import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import SeasonCoveragePage from '~/pages/SeasonCoveragePage';
import { fetchSeasonCoverage } from '~/services/seasons.server';
import { getDefaultLocale } from '~/utils/locale.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.coverage) {
    return [{ title: 'Season Not Found - Harkkapankki' }];
  }
  return [{ title: `Coverage — ${data.coverage.season.name} - Harkkapankki` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const coverage = await fetchSeasonCoverage(params.slug!, getDefaultLocale());
  if (!coverage) {
    throw new Response('Season not found', { status: 404 });
  }
  return { coverage };
}

export default function SeasonCoverageRoute() {
  const { coverage } = useLoaderData<typeof loader>();
  return <SeasonCoveragePage coverage={coverage} />;
}
