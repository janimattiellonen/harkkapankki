import { useState } from 'react';
import { useSubmit } from '@remix-run/react';
import { ExerciseForm } from '~/components/ExerciseForm';
import type { Exercise } from '@prisma/client';
import type { ExerciseTypeOption } from '~/types';
import { useTranslation } from 'react-i18next';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const submit = useSubmit();
  const { t } = useTranslation();

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    const formData = new FormData();
    formData.append('intent', 'delete');
    submit(formData, { method: 'post' });
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('exercises.edit')}</h1>

      {/* Success message for update */}
      {actionData && 'success' in actionData && actionData.success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{actionData.message}</p>
        </div>
      )}

      <ExerciseForm
        exercise={exercise}
        submitText={t('exercises.updateExercise')}
        showSaveAndContinue={true}
        errors={actionData && 'errors' in actionData ? actionData.errors : undefined}
        defaultValues={actionData && 'values' in actionData ? actionData.values : undefined}
        exerciseTypes={exerciseTypes}
      />

      {/* Delete Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleDeleteClick}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {t('exercises.delete')}
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{t('exercises.delete')}</h2>
            <p className="text-gray-700 mb-6">{t('exercises.deleteConfirmPermanent')}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
