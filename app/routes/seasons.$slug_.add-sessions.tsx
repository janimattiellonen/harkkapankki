import {
  data,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import { useActionData, useLoaderData } from 'react-router';
import AddSessionsPage from '~/pages/AddSessionsPage';
import { addSessionsSchema } from '~/schemas/addSessions';
import { createSessionsForSeason, fetchAddSessionsContext } from '~/services/seasons.server';
import { getDefaultLocale } from '~/utils/locale.server';
import { parseData } from '~/utils/validation';

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  if (!loaderData?.season) {
    return [{ title: 'Season Not Found - Harkkapankki' }];
  }
  return [{ title: `Add sessions to ${loaderData.season.name} - Harkkapankki` }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const ctx = await fetchAddSessionsContext(params.slug!, getDefaultLocale());
  if (!ctx) {
    throw new Response('Season not found', { status: 404 });
  }
  return { season: ctx.season };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const ctx = await fetchAddSessionsContext(params.slug!, getDefaultLocale());
  if (!ctx) {
    throw new Response('Season not found', { status: 404 });
  }

  const formData = await request.formData();
  const formDataObj = Object.fromEntries(formData);

  const result = parseData(addSessionsSchema, formDataObj);
  if (!result.success) {
    return data({ errors: result.errors }, { status: 400 });
  }

  const { warnings } = await createSessionsForSeason({
    season: { id: ctx.season.id, slug: ctx.season.slug },
    sections: ctx.sections,
    rows: result.data.rows,
  });

  const params2 = new URLSearchParams();
  if (warnings.length > 0) {
    params2.set('warnings', String(warnings.length));
  }
  const query = params2.toString();
  return redirect(`/seasons/${ctx.season.slug}${query ? `?${query}` : ''}`);
}

export default function AddSessionsRoute() {
  const { season } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return <AddSessionsPage season={season} actionData={actionData} />;
}
