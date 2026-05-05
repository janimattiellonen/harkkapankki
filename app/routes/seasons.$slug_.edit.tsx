import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import { useActionData, useLoaderData } from 'react-router';
import EditSeasonPage from '~/pages/EditSeasonPage';
import { seasonSchema } from '~/schemas/season';
import { fetchSeasonBySlug, updateSeason } from '~/services/seasons.server';
import { parseData } from '~/utils/validation';

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData?.season) {
    return [{ title: 'Season Not Found - Harkkapankki' }];
  }
  return [{ title: `Edit ${loaderData.season.name} - Harkkapankki` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const season = await fetchSeasonBySlug(params.slug!);
  if (!season) {
    throw new Response('Season not found', { status: 404 });
  }
  return { season };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const season = await fetchSeasonBySlug(params.slug!);
  if (!season) {
    throw new Response('Season not found', { status: 404 });
  }

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

  await updateSeason({ id: season.id, ...result.data });
  return redirect(`/seasons/${season.slug}`);
}

export default function EditSeasonRoute() {
  const { season } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return <EditSeasonPage season={season} actionData={actionData} />;
}
