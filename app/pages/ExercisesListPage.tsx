import { useState, useEffect } from 'react';
import { Link, useNavigation, useNavigate } from '@remix-run/react';
import { ExerciseFilters as ExerciseFiltersComponent } from '~/components/ExerciseFilters';
import { useExerciseFilters } from '~/hooks/useExerciseFilters';
import type { ExerciseWithTypePath } from '~/services/exercises.server';
import type { ExerciseTypeOption } from '~/types';

type ExerciseData = Omit<ExerciseWithTypePath, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type ExercisesListPageProps = {
  exercises: ExerciseData[];
  exerciseTypes: ExerciseTypeOption[];
  deleted?: boolean;
};

export default function ExercisesListPage({
  exercises,
  exerciseTypes,
  deleted,
}: ExercisesListPageProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  // When deleted prop is true, show message and clean up URL
  useEffect(() => {
    if (deleted) {
      setShowDeleteSuccess(true);
      // Clean up the URL by removing the query parameter
      navigate('/exercises', { replace: true });
    }
  }, [deleted, navigate]);

  const {
    searchTerm,
    setSearchTerm,
    selectedTypeIds,
    toggleExerciseType,
    clearFilters,
    hasActiveFilters,
    isParentSelected,
    isParentIndeterminate,
  } = useExerciseFilters({ exerciseTypes });

  const formatDate = (dateString: string, locale: string = 'fi-FI') => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  const isNavigating = navigation.state === 'loading';

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Training Exercises</h1>
        <Link
          to="/exercises/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          New Exercise
        </Link>
      </div>

      {/* Success message for deletion */}
      {showDeleteSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-800">Exercise deleted successfully</p>
            <button
              onClick={() => setShowDeleteSuccess(false)}
              className="text-green-600 hover:text-green-800"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filter Component */}
      <ExerciseFiltersComponent
        exerciseTypes={exerciseTypes}
        searchTerm={searchTerm}
        selectedTypeIds={selectedTypeIds}
        onSearchChange={setSearchTerm}
        onTypeToggle={toggleExerciseType}
        onClearFilters={clearFilters}
        isParentSelected={isParentSelected}
        isParentIndeterminate={isParentIndeterminate}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Exercise List */}
      <div className="relative">
        {isNavigating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {exercises.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No exercises found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters to find what you&apos;re looking for.
            </p>
            {hasActiveFilters && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {exercises.map((exercise: ExerciseData) => (
              <Link
                key={exercise.id}
                to={exercise.slug}
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
                        {exercise.exerciseTypePath && <> - {exercise.exerciseTypePath}</>}
                      </p>
                      {exercise.description && (
                        <p className="text-gray-600 mt-2 line-clamp-2">{exercise.description}</p>
                      )}
                    </div>
                    {exercise.duration > 0 && (
                      <div className="flex items-center text-sm text-gray-500 ml-4 flex-shrink-0">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {exercise.duration} min
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
