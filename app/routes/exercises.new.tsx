import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ExerciseForm } from "~/components/ExerciseForm";
import { exerciseSchema } from "~/schemas/exercise";
import { createExercise } from "~/services/exercises.server";
import { fetchExerciseTypeOptions } from "~/services/exerciseTypes.server";
import { parseData } from "~/utils/validation";

export async function loader({ request }: LoaderFunctionArgs) {
  const exerciseTypes = await fetchExerciseTypeOptions('en');
  return json({ exerciseTypes });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  const result = parseData(exerciseSchema, data);
  if (!result.success) {
    return json({ 
      errors: result.errors,
      values: data
    }, { status: 400 });
  }

  await createExercise(result.data);
  return redirect("/exercises");
}

export default function NewExercise() {
  const { exerciseTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">New Exercise</h1>
      <Form method="post">
        <ExerciseForm 
          submitText="Create Exercise" 
          errors={actionData?.errors}
          defaultValues={actionData?.values}
          exerciseTypes={exerciseTypes}
        />
      </Form>
    </div>
  );
}