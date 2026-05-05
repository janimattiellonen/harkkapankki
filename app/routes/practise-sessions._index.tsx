import type { MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import PractiseSessionsList from '~/pages/PractiseSessionsList';
import { fetchPracticeSessions } from '~/services/practiceSessions.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Practice Sessions - Harkkapankki' }];
};

export async function loader() {
  const sessions = await fetchPracticeSessions({ standaloneOnly: true });
  return { sessions };
}

export default function PracticeSessionsIndex() {
  const { sessions } = useLoaderData<typeof loader>();
  return <PractiseSessionsList sessions={sessions} />;
}
