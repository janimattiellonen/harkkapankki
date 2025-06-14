import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ExerciseForm } from "~/components/ExerciseForm";
import { exerciseSchema } from "~/schemas/exercise";
import { fetchExerciseById, updateExercise } from "~/services/exercises.server";
import { fetchExerciseTypeOptions } from "~/services/exerciseTypes.server";
import { parseData } from "~/utils/validation";

export async function loader({ params }: LoaderFunctionArgs) {
  const [exercise, exerciseTypes] = await Promise.all([
    fetchExerciseById(params.id!, 'en'),
    fetchExerciseTypeOptions('en')
  ]);

  if (!exercise) {
    throw new Response("Exercise not found", { status: 404 });
  }

  return json({ exercise, exerciseTypes });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  const result = parseData(exerciseSchema, data);
  if (!result.success) {
    return json({ 
      errors: result.errors,
      values: data
    }, { status: 400 });
  }

  await updateExercise(params.id!, result.data);
  return redirect(`/exercises/${params.id}`);
}

export default function EditExercise() {
  const { exercise, exerciseTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Exercise</h1>
      <Form method="post">
        <ExerciseForm 
          exercise={exercise}
          submitText="Update Exercise"
          errors={actionData?.errors}
          defaultValues={actionData?.values}
          exerciseTypes={exerciseTypes}
        />
      </Form>
    </div>
  );
}