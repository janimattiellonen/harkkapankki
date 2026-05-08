import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import { useActionData, useLoaderData } from 'react-router';
import PractiseSessionDetail from '~/pages/PractiseSessionDetail';
import { retrospectiveSchema } from '~/schemas/retrospective';
import { fetchPracticeSessionBySlug } from '~/services/practiceSessions.server';
import {
  createRetrospective,
  deleteRetrospective,
  updateRetrospective,
} from '~/services/retrospectives.server';
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

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  const session = await fetchPracticeSessionBySlug(params.slug!, getDefaultLocale());
  if (!session) {
    throw new Response('Practice session not found', { status: 404 });
  }

  if (intent === 'retrospective-delete') {
    const retrospectiveId = formData.get('retrospectiveId');
    if (typeof retrospectiveId !== 'string' || retrospectiveId === '') {
      return data(
        { intent, fieldErrors: {}, formError: 'Missing retrospective id' },
        { status: 400 }
      );
    }
    try {
      await deleteRetrospective(retrospectiveId);
      return redirect(`/practise-sessions/${session.slug}`);
    } catch {
      return data(
        { intent, fieldErrors: {}, formError: 'Failed to delete retrospective' },
        { status: 500 }
      );
    }
  }

  if (intent === 'retrospective-create' || intent === 'retrospective-update') {
    const parsed = retrospectiveSchema.safeParse({
      participantCount: formData.get('participantCount'),
      summary: formData.get('summary'),
      wentWell: formData.get('wentWell'),
      improvements: formData.get('improvements'),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return data({ intent, fieldErrors, formError: undefined }, { status: 400 });
    }

    try {
      if (intent === 'retrospective-create') {
        await createRetrospective(session.id, parsed.data);
      } else {
        const retrospectiveId = formData.get('retrospectiveId');
        if (typeof retrospectiveId !== 'string' || retrospectiveId === '') {
          return data(
            { intent, fieldErrors: {}, formError: 'Missing retrospective id' },
            { status: 400 }
          );
        }
        await updateRetrospective(retrospectiveId, parsed.data);
      }
      return redirect(`/practise-sessions/${session.slug}`);
    } catch {
      return data(
        { intent, fieldErrors: {}, formError: 'Failed to save retrospective' },
        { status: 500 }
      );
    }
  }

  return data({ intent: null, fieldErrors: {}, formError: 'Unknown intent' }, { status: 400 });
}

export default function PracticeSessionDetailRoute() {
  const { session } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return <PractiseSessionDetail session={session} actionData={actionData} />;
}
