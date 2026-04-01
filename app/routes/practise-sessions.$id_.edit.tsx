import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import EditPractiseSessionPage from '~/pages/EditPractiseSessionPage';
import {
  fetchPracticeSessionById,
  updatePracticeSession,
} from '~/services/practiceSessions.server';
import { fetchSectionsForPractiseSession } from '~/services/sections.server';
import type { SelectedItem } from '~/types';
import { getDefaultLocale } from '~/utils/locale.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.session) {
    return [{ title: 'Practice Session Not Found - Harkkapankki' }];
  }
  return [{ title: `Edit ${data.session.name || 'Practice Session'} - Harkkapankki` }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const sessionLength = parseInt(formData.get('sessionLength') as string, 10);
  const selectedItemsJson = formData.get('selectedItems') as string;
  const selectedItems: SelectedItem[] = JSON.parse(selectedItemsJson);

  const session = await updatePracticeSession({
    id: params.id!,
    name: name || undefined,
    description: description || undefined,
    sessionLength,
    selectedItems,
  });

  return redirect(`/practise-sessions/${session.slug}`);
}

export async function loader({ params }: LoaderFunctionArgs) {
  const [session, sections] = await Promise.all([
    fetchPracticeSessionById(params.id!, getDefaultLocale()),
    fetchSectionsForPractiseSession(getDefaultLocale()),
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
