import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { fetchExercises } from "~/services/exercises.server";
import type { Exercise } from "@prisma/client";

type ExerciseData = Omit<Exercise, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export const loader = async () => {
  const exercises = await fetchExercises();
  return json({ exercises });
};

export default function Exercises() {
  const { exercises } = useLoaderData<typeof loader>();

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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-blue-600">{exercise.name}</h2>
                {exercise.description && (
                  <p className="text-gray-600 mt-2">{exercise.description}</p>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {exercise.duration} min
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}