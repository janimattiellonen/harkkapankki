import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import EditExercisePage from '~/pages/EditExercisePage';
import { exerciseSchema } from '~/schemas/exercise';
import { fetchExerciseById, updateExercise } from '~/services/exercises.server';
import { fetchExerciseTypeOptions } from '~/services/exerciseTypes.server';
import { parseData } from '~/utils/validation';
import { parseFormData } from '~/utils/upload.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const [exercise, exerciseTypes] = await Promise.all([
    fetchExerciseById(params.id!, 'en'),
    fetchExerciseTypeOptions('en', 'exercise-form'),
  ]);

  if (!exercise) {
    throw new Response('Exercise not found', { status: 404 });
  }

  return json({ exercise, exerciseTypes });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await parseFormData(request);
  const data = Object.fromEntries(formData);

  const result = parseData(exerciseSchema, data);
  if (!result.success) {
    return json({
      errors: result.errors,
      values: data,
    }, { status: 400 });
  }

  // Check if user wants to remove the image
  const removeImage = formData.get('removeImage') === 'true';

  // Get image path from formData if uploaded
  const imageValue = formData.get('image');
  const newImage = typeof imageValue === 'string' && imageValue ? imageValue : null;

  // Fetch existing exercise to preserve image if not updated or removed
  const existingExercise = await fetchExerciseById(params.id!, 'en');

  if (!existingExercise) {
    throw new Response('Exercise not found', { status: 404 });
  }

  let finalImage: string | null = null;
  if (removeImage) {
    // User wants to remove the image
    finalImage = null;
  } else if (newImage) {
    // User uploaded a new image
    finalImage = newImage;
  } else {
    // Keep existing image
    finalImage = existingExercise.image || null;
  }

  const updatedExercise = await updateExercise(params.id!, {
    ...result.data,
    image: finalImage,
  });

  // Check if user wants to stay on the page
  const saveAndContinue = formData.get('saveAndContinue') === 'true';

  if (saveAndContinue) {
    return json({ success: true, message: 'Exercise updated successfully' });
  }

  return redirect(`/exercises/${updatedExercise.slug}`);
}

export default function EditExercise() {
  const { exercise, exerciseTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return <EditExercisePage exercise={exercise} exerciseTypes={exerciseTypes} actionData={actionData}/>;
}