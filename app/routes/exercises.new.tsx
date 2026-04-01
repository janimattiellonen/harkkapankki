import { data, redirect, type ActionFunctionArgs } from 'react-router';
import { useActionData, useLoaderData } from 'react-router';
import NewExercisePage from '~/pages/NewExercisePage';
import { exerciseSchema } from '~/schemas/exercise';
import { createExercise } from '~/services/exercises.server';
import { fetchExerciseTypeOptions } from '~/services/exerciseTypes.server';
import { parseData } from '~/utils/validation';
import { parseFormData } from '~/utils/upload.server';
import { getDefaultLocale } from '~/utils/locale.server';

export async function loader() {
  const exerciseTypes = await fetchExerciseTypeOptions(getDefaultLocale(), 'exercise-form');
  return { exerciseTypes };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await parseFormData(request);
  const formDataObj = Object.fromEntries(formData);

  const result = parseData(exerciseSchema, formDataObj);
  if (!result.success) {
    return data(
      {
        errors: result.errors,
        values: formDataObj,
      },
      { status: 400 }
    );
  }

  // Get image path from formData if uploaded
  const imageValue = formData.get('image');
  const image = typeof imageValue === 'string' && imageValue ? imageValue : null;

  const exercise = await createExercise({
    ...result.data,
    image,
  });
  return redirect(`/exercises/${exercise.slug}`);
}

export default function NewExercise() {
  const { exerciseTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return <NewExercisePage exerciseTypes={exerciseTypes} actionData={actionData} />;
}
