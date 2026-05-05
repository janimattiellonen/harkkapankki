import { data, redirect, type ActionFunctionArgs, type MetaFunction } from 'react-router';
import { useActionData } from 'react-router';
import NewSeasonPage from '~/pages/NewSeasonPage';
import { seasonSchema } from '~/schemas/season';
import { createSeason } from '~/services/seasons.server';
import { parseData } from '~/utils/validation';

export const meta: MetaFunction = () => {
  return [{ title: 'New Season - Harkkapankki' }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const formDataObj = Object.fromEntries(formData);

  const result = parseData(seasonSchema, formDataObj);
  if (!result.success) {
    return data(
      {
        errors: result.errors,
        values: formDataObj,
      },
      { status: 400 }
    );
  }

  const season = await createSeason(result.data);
  return redirect(`/seasons/${season.slug}`);
}

export default function NewSeason() {
  const actionData = useActionData<typeof action>();
  return <NewSeasonPage actionData={actionData} />;
}
