import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import PractiseSessionDetail from '~/pages/PractiseSessionDetail';
import { fetchPracticeSessionBySlug } from '~/services/practiceSessions.server';
import { getDefaultLocale } from '~/utils/locale.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.session) {
    return [{ title: 'Practice Session Not Found - Harkkapankki' }];
  }
  return [{ title: `${data.session.name || 'Practice Session'} - Harkkapankki` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const session = await fetchPracticeSessionBySlug(params.slug!, getDefaultLocale());

  if (!session) {
    throw new Response('Practice session not found', { status: 404 });
  }

  return { session };
}

export default function PracticeSessionDetailRoute() {
  const { session } = useLoaderData<typeof loader>();
  return <PractiseSessionDetail session={session} />;
}
