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
      <form onSubmit={onSubmit} method="post" className="space-y-4">
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
    </div>
  );
}