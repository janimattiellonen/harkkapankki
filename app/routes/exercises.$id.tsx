import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { fetchExerciseById } from "~/services/exercises.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const exercise = await fetchExerciseById(params.id!);

  if (!exercise) {
    throw new Response("Exercise not found", { status: 404 });
  }

  return json({ exercise });
}

export default function ExerciseDetail() {
  const { exercise } = useLoaderData<typeof loader>();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{exercise.name}</h1>
      
      {exercise.description && (
        <p className="text-gray-600 mb-6">{exercise.description}</p>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="prose max-w-none whitespace-pre-line">
          {exercise.content}
        </div>
        
        <div className="mt-6 flex items-center text-sm text-gray-500">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Duration: {exercise.duration} minutes
        </div>

        {exercise.youtubeVideo && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Video Tutorial</h2>
            <a 
              href={exercise.youtubeVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Watch Tutorial
            </a>
          </div>
        )}
      </div>
    </div>
  );
}