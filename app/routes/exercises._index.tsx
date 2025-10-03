import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { fetchExercises } from "~/services/exercises.server";
import type { ExerciseWithTypePath } from "~/services/exercises.server";

type ExerciseData = Omit<ExerciseWithTypePath, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export const loader = async () => {
  const exercises = await fetchExercises();
  return json({ exercises });
};

export default function Exercises() {
  const { exercises } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string, locale: string = 'fi-FI') => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Training Exercises</h1>
      <div className="grid gap-4">
        {exercises.map((exercise: ExerciseData) => (
          <Link
            key={exercise.id}
            to={exercise.id}
            className="block border p-4 rounded-lg hover:border-blue-500 hover:shadow-md transition duration-150"
          >
            <div className="flex gap-4 items-center">
              {/* Image or placeholder */}
              <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-gray-200">
                {exercise.image ? (
                  <img
                    src={exercise.image}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex justify-between items-start min-w-0">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-blue-600">{exercise.name}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(exercise.createdAt)}
                    {exercise.exerciseTypePath && (
                      <> - {exercise.exerciseTypePath}</>
                    )}
                  </p>
                  {exercise.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">{exercise.description}</p>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 ml-4 flex-shrink-0">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {exercise.duration} min
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}