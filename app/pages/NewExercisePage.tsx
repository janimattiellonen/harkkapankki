import { Form } from "@remix-run/react";
import { ExerciseForm } from "~/components/ExerciseForm";
import type { ExerciseTypeOption } from "~/types";

type NewExercisePageProps = {
  exerciseTypes: ExerciseTypeOption[];
  actionData?: {
    errors?: Record<string, string>;
    values?: Record<string, unknown>;
  };
};

export default function NewExercisePage({ exerciseTypes, actionData }: NewExercisePageProps) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">New Exercise</h1>
      <Form method="post">
        <ExerciseForm
          submitText="Create Exercise"
          errors={actionData && 'errors' in actionData ? actionData.errors : undefined}
          defaultValues={actionData && 'values' in actionData ? actionData.values : undefined}
          exerciseTypes={exerciseTypes}
        />
      </Form>
    </div>
  );
}
