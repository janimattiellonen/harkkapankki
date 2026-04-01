import { redirect, type ActionFunctionArgs, type MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import PractiseSessionForm from '~/pages/PractiseSessionForm';
import { fetchSectionsForPractiseSession } from '~/services/sections.server';
import { createPracticeSession } from '~/services/practiceSessions.server';
import type { SelectedItem } from '~/types';
import { getDefaultLocale } from '~/utils/locale.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Design Practice Session - Harkkapankki' }];
};

export async function loader() {
  const sections = await fetchSectionsForPractiseSession(getDefaultLocale());
  return { sections };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const sessionLength = parseInt(formData.get('sessionLength') as string, 10);
  const selectedItemsJson = formData.get('selectedItems') as string;
  const selectedItems: SelectedItem[] = JSON.parse(selectedItemsJson);

  const session = await createPracticeSession({
    name: name || undefined,
    description: description || undefined,
    sessionLength,
    selectedItems,
  });

  return redirect(`/practise-sessions/${session.slug}`);
}

export default function NewPractiseSession() {
  const { sections } = useLoaderData<typeof loader>();
  return <PractiseSessionForm sections={sections} />;
}
