import {
  data,
  redirect,
  redirectDocument,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import { useLoaderData } from 'react-router';
import EditPractiseSessionPage from '~/pages/EditPractiseSessionPage';
import {
  deletePracticeSession,
  fetchPracticeSessionById,
  updatePracticeSession,
} from '~/services/practiceSessions.server';
import { fetchSectionsForPractiseSession } from '~/services/sections.server';
import type { SelectedItem } from '~/types';
import { getDefaultLocale } from '~/utils/locale.server';
import { helsinkiWallClockToUtc } from '~/utils/timezone';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.session) {
    return [{ title: 'Practice Session Not Found - Harkkapankki' }];
  }
  return [{ title: `Edit ${data.session.name || 'Practice Session'} - Harkkapankki` }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'delete') {
    try {
      await deletePracticeSession(params.id!);
      return redirectDocument('/practise-sessions?deleted=true');
    } catch (error) {
      return data(
        {
          success: false,
          message: 'Failed to delete practice session. Please try again.',
        },
        { status: 500 }
      );
    }
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const sessionLength = parseInt(formData.get('sessionLength') as string, 10);
  const selectedItemsJson = formData.get('selectedItems') as string;
  const selectedItems: SelectedItem[] = JSON.parse(selectedItemsJson);
  const scheduledDate = (formData.get('scheduledDate') as string | null) || '';
  const scheduledTime = (formData.get('scheduledTime') as string | null) || '';
  const scheduledAt =
    scheduledDate && scheduledTime ? helsinkiWallClockToUtc(scheduledDate, scheduledTime) : null;

  const session = await updatePracticeSession({
    id: params.id!,
    name: name || undefined,
    description: description || undefined,
    sessionLength,
    scheduledAt,
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

  return { session, sections };
}

export default function EditPractiseSession() {
  const { session, sections } = useLoaderData<typeof loader>();
  return <EditPractiseSessionPage session={session} sections={sections} />;
}
