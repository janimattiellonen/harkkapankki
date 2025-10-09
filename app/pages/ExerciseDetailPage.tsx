import { Link } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type MDEditor from '@uiw/react-md-editor';
import { rehypeYouTube } from '~/utils/rehype-youtube';
import { useTranslation } from 'react-i18next';

type Exercise = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  content: string;
  image?: string | null;
  youtubeVideo?: string | null;
  duration: number;
  exerciseTypePath?: string | null;
  createdAt: string;
};

type ExerciseDetailPageProps = {
  exercise: Exercise;
};

export default function ExerciseDetailPage({ exercise }: ExerciseDetailPageProps) {
  const [MarkdownComponent, setMarkdownComponent] = useState<typeof MDEditor.Markdown | null>(null);
  const {t} = useTranslation();

  useEffect(() => {
    import('@uiw/react-md-editor').then(mod => {
      setMarkdownComponent(() => mod.default.Markdown);
    });
  }, []);

  const formatDate = (dateString: string, locale: string = 'fi-FI') => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">{exercise.name}</h1>
          <p className="text-xs text-gray-500 mt-1">{formatDate(exercise.createdAt)}</p>
        </div>
        <Link
          to={`/exercises/${exercise.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('exercises.edit')}
        </Link>
      </div>

      {exercise.description && <p className="text-gray-600 mb-6">{exercise.description}</p>}

      {exercise.image && (
        <div className="mb-6">
          <img
            src={exercise.image}
            alt={exercise.name}
            className="w-full max-w-2xl rounded-lg shadow-lg object-cover"
          />
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-2">
          {MarkdownComponent ? (
            <MarkdownComponent source={exercise.content} rehypePlugins={[rehypeYouTube]} />
          ) : (
            <div className="whitespace-pre-line">{exercise.content}</div>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t('exercises.durationInMinutes', {duration: exercise.duration})}
          </div>

          {exercise.exerciseTypePath && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Type: {exercise.exerciseTypePath}
            </div>
          )}
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
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch Tutorial
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
