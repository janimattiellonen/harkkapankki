import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Exercise } from "@prisma/client";
import { exerciseFormSchema, type ExerciseFormData } from "~/schemas/exercise";
import { useEffect, useState } from "react";
import type { ExerciseTypeOption } from "~/types";
import type MDEditor from "@uiw/react-md-editor";

type SerializedExercise = Omit<Exercise, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type ExerciseFormProps = {
  exercise?: SerializedExercise;
  submitText?: string;
  errors?: Record<string, string>;
  defaultValues?: ExerciseFormData;
  exerciseTypes: ExerciseTypeOption[];
};

export function ExerciseForm({
  exercise,
  submitText = "Save",
  errors,
  defaultValues,
  exerciseTypes
}: ExerciseFormProps) {
  const [MDEditorComponent, setMDEditorComponent] = useState<typeof MDEditor | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [imageToRemove, setImageToRemove] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import MDEditor only on the client side
    import("@uiw/react-md-editor").then((mod) => {
      setMDEditorComponent(() => mod.default);
    });
  }, []);

  const {
    register,
    control,
    formState: { errors: formErrors },
    setError,
    clearErrors,
    handleSubmit,
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseFormSchema),
    values: defaultValues || (exercise ? {
      name: exercise.name ?? "",
      description: exercise.description ?? "",
      content: exercise.content ?? "",
      youtubeVideo: exercise.youtubeVideo ?? "",
      duration: String(exercise.duration ?? 0),
      exerciseTypeId: exercise.exerciseTypeId ?? "",
    } : undefined)
  });

  // Set server-side errors
  useEffect(() => {
    if (errors) {
      Object.entries(errors).forEach(([field, message]) => {
        setError(field as keyof ExerciseFormData, {
          type: 'server',
          message,
        });
      });
    }
  }, [errors, setError]);

  const onSubmit = handleSubmit(() => {
    // Clear all errors before submitting
    clearErrors();
  });

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} method="post" encType="multipart/form-data" className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            {...register("description")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                {MDEditorComponent ? (
                  <MDEditorComponent
                    value={value}
                    onChange={onChange}
                    preview="edit"
                    height={400}
                  />
                ) : (
                  <textarea
                    id="content"
                    name="content"
                    rows={10}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
                <input type="hidden" name="content" value={value} />
              </>
            )}
          />
          {formErrors.content && (
            <p className="mt-1 text-sm text-red-600">{formErrors.content.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="exerciseTypeId" className="block text-sm font-medium text-gray-700">
            Exercise Type
          </label>
          <select
            id="exerciseTypeId"
            {...register("exerciseTypeId")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select exercise type...</option>
            {exerciseTypes.map((type) => (
              <optgroup key={type.id} label={type.name}>
                {/* Parent type as an option */}
                <option value={type.id}>{type.name}</option>
                
                {/* Child types */}
                {type.children?.map((child) => (
                  <option key={child.id} value={child.id}>↳ {child.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {formErrors.exerciseTypeId && (
            <p className="mt-1 text-sm text-red-600">{formErrors.exerciseTypeId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {exercise?.image && !imageToRemove && (
            <div className="mt-2 flex items-center gap-4">
              <p className="text-sm text-gray-500">
                Current: <a href={exercise.image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{exercise.image}</a>
              </p>
              <button
                type="button"
                onClick={() => {
                  setImageToRemove(exercise.image);
                  setShowRemoveDialog(true);
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </div>
          )}
          {imageToRemove && (
            <>
              <input type="hidden" name="removeImage" value="true" />
              <p className="mt-2 text-sm text-amber-600">
                Image will be removed when you save
              </p>
            </>
          )}
        </div>

        <div>
          <label htmlFor="youtubeVideo" className="block text-sm font-medium text-gray-700">
            YouTube Video URL
          </label>
          <input
            type="text"
            id="youtubeVideo"
            {...register("youtubeVideo")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {formErrors.youtubeVideo && (
            <p className="mt-1 text-sm text-red-600">{formErrors.youtubeVideo.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            min="1"
            max="255"
            {...register("duration")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {formErrors.duration && (
            <p className="mt-1 text-sm text-red-600">{formErrors.duration.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {submitText}
          </button>
        </div>
      </form>

      {/* Remove Image Confirmation Dialog */}
      {showRemoveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Image</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this image? The image file will remain on the server, but it will no longer be associated with this exercise.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRemoveDialog(false);
                  setImageToRemove(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRemoveDialog(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}