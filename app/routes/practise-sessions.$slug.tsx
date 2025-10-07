import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import PractiseSessionDetail from '~/pages/PractiseSessionDetail';
import { fetchPracticeSessionBySlug } from '~/services/practiceSessions.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.session) {
    return [{ title: 'Practice Session Not Found - Harkkapankki' }];
  }
  return [{ title: `${data.session.name || 'Practice Session'} - Harkkapankki` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const session = await fetchPracticeSessionBySlug(params.slug!, 'en');

  if (!session) {
    throw new Response('Practice session not found', { status: 404 });
  }

  return json({ session });
}

export default function PracticeSessionDetailRoute() {
  const { session } = useLoaderData<typeof loader>();
  return <PractiseSessionDetail session={session} />;
}
