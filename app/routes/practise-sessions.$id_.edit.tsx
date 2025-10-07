import { json } from '@remix-run/node';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import EditPractiseSessionPage from '~/pages/EditPractiseSessionPage';
import { fetchPracticeSessionById } from '~/services/practiceSessions.server';
import { fetchSectionsForPractiseSession } from '~/services/sections.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.session) {
    return [{ title: 'Practice Session Not Found - Harkkapankki' }];
  }
  return [{ title: `Edit ${data.session.name || 'Practice Session'} - Harkkapankki` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const [session, sections] = await Promise.all([
    fetchPracticeSessionById(params.id!, 'en'),
    fetchSectionsForPractiseSession('en'),
  ]);

  if (!session) {
    throw new Response('Practice session not found', { status: 404 });
  }

  return json({ session, sections });
}

export default function EditPractiseSession() {
  const { session, sections } = useLoaderData<typeof loader>();
  return <EditPractiseSessionPage session={session} sections={sections} />;
}
