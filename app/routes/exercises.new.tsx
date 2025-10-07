import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import NewExercisePage from "~/pages/NewExercisePage";
import { exerciseSchema } from "~/schemas/exercise";
import { createExercise } from "~/services/exercises.server";
import { fetchExerciseTypeOptions } from "~/services/exerciseTypes.server";
import { parseData } from "~/utils/validation";
import { parseFormData } from "~/utils/upload.server";

export async function loader() {
  const exerciseTypes = await fetchExerciseTypeOptions('en', 'exercise-form');
  return json({ exerciseTypes });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await parseFormData(request);
  const data = Object.fromEntries(formData);

  const result = parseData(exerciseSchema, data);
  if (!result.success) {
    return json({
      errors: result.errors,
      values: data
    }, { status: 400 });
  }

  // Get image path from formData if uploaded
  const imageValue = formData.get("image");
  const image = typeof imageValue === "string" && imageValue ? imageValue : null;

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