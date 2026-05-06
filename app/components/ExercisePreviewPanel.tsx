import { useEffect, useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { useTranslation } from 'react-i18next';
import type MDEditor from '@uiw/react-md-editor';
import { rehypeYouTube } from '~/utils/rehype-youtube';

type PreviewExercise = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  content: string;
  image?: string | null;
  youtubeVideo?: string | null;
  duration: number;
  exerciseTypePath?: string | null;
};

type FetcherData = {
  exercise: PreviewExercise;
};

type ExercisePreviewPanelProps = {
  slug: string;
  onClose: () => void;
};

export default function ExercisePreviewPanel({ slug, onClose }: ExercisePreviewPanelProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher<FetcherData>();
  const [MarkdownComponent, setMarkdownComponent] = useState<typeof MDEditor.Markdown | null>(null);

  useEffect(() => {
    import('@uiw/react-md-editor').then(mod => {
      setMarkdownComponent(() => mod.default.Markdown);
    });
  }, []);

  useEffect(() => {
    fetcher.load(`/exercises/${slug}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const isLoading = fetcher.state === 'loading' || (!fetcher.data && !fetcher.state);
  const exercise = fetcher.data?.exercise;
  const loadFailed = fetcher.state === 'idle' && !fetcher.data;

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-lg">
        <h2 className="text-lg font-semibold truncate pr-2">
          {exercise?.name || t('common.loading')}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('sessions.closePreview')}
          className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {isLoading && !exercise && <p className="text-gray-500">{t('common.loading')}</p>}

        {loadFailed && !exercise && <p className="text-red-600">{t('exercises.notFound')}</p>}

        {exercise && (
          <>
            {exercise.description && <p className="text-gray-600 mb-4">{exercise.description}</p>}

            {exercise.image && (
              <div className="mb-4">
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="w-full rounded-md shadow object-cover"
                />
              </div>
            )}

            <div className="[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-2">
              {MarkdownComponent ? (
                <MarkdownComponent source={exercise.content} rehypePlugins={[rehypeYouTube]} />
              ) : (
                <div className="whitespace-pre-line">{exercise.content}</div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t('exercises.durationInMinutes', { duration: exercise.duration })}
              </div>

              {exercise.exerciseTypePath && (
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {t('exercises.type')}: {exercise.exerciseTypePath}
                </div>
              )}

              {exercise.youtubeVideo && (
                <a
                  href={exercise.youtubeVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  {t('exercises.watchTutorial')}
                </a>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link
                to={`/exercises/${exercise.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {t('sessions.openInNewTab')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
