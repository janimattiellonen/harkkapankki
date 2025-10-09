import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

type PracticeSession = {
  id: string;
  slug: string;
  name: string | null;
  description: string | null;
  sessionLength: number;
  createdAt: Date | string;
  _count: {
    sectionItems: number;
  };
};

type PractiseSessionsListProps = {
  sessions: PracticeSession[];
};

export default function PractiseSessionsList({ sessions }: PractiseSessionsListProps) {
  const { t } = useTranslation();
  const formatDate = (dateString: Date | string, locale: string = 'fi-FI') => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('sessions.title')}</h1>
        <Link
          to="/practise-sessions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t('sessions.new')}
        </Link>
      </div>

      {sessions.length === 0 ? (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('sessions.noSessionsYet')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('sessions.getStarted')}</p>
          <div className="mt-6">
            <Link
              to="/practise-sessions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('sessions.create')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => (
            <Link
              key={session.id}
              to={session.slug}
              className="block border p-4 rounded-lg hover:border-blue-500 hover:shadow-md transition duration-150"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-blue-600">
                    {session.name || t('sessions.untitledSession')}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(session.createdAt)}</p>
                  {session.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">{session.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end ml-4 flex-shrink-0 gap-2">
                  <div className="flex items-center text-sm text-gray-500">
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
                    {session.sessionLength} {t('exercises.min')}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    {session._count.sectionItems}{' '}
                    {session._count.sectionItems === 1 ? t('sessions.item') : t('sessions.items')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
