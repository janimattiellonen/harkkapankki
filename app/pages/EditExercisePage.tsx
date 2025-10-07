import { Form } from '@remix-run/react';
import { ExerciseForm } from '~/components/ExerciseForm';
import type { Exercise } from '@prisma/client';
import type { ExerciseTypeOption } from '~/types';

type SerializedExercise = Omit<Exercise, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type EditExercisePageProps = {
  exercise: SerializedExercise;
  exerciseTypes: ExerciseTypeOption[];
  actionData?: {
    success?: boolean;
    message?: string;
    errors?: Record<string, string>;
    values?: Record<string, unknown>;
  };
};

export default function EditExercisePage({
  exercise,
  exerciseTypes,
  actionData,
}: EditExercisePageProps) {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Exercise</h1>
      {actionData && 'success' in actionData && actionData.success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{actionData.message}</p>
        </div>
      )}
      <Form method="post">
        <ExerciseForm
          exercise={exercise}
          submitText="Update Exercise"
          showSaveAndContinue={true}
          errors={actionData && 'errors' in actionData ? actionData.errors : undefined}
          defaultValues={actionData && 'values' in actionData ? actionData.values : undefined}
          exerciseTypes={exerciseTypes}
        />
      </Form>
    </div>
  );
}
