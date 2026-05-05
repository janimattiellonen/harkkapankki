import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

type SeasonListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  createdAt: Date | string;
  _count: {
    practiceSessions: number;
  };
};

type SeasonsListProps = {
  seasons: SeasonListItem[];
};

export default function SeasonsList({ seasons }: SeasonsListProps) {
  const { t } = useTranslation();
  const formatDate = (value: Date | string, locale: string = 'fi-FI') =>
    new Date(value).toLocaleDateString(locale);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('seasons.title')}</h1>
        <Link
          to="/seasons/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t('seasons.new')}
        </Link>
      </div>

      {seasons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('seasons.noSeasonsYet')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('seasons.getStarted')}</p>
          <div className="mt-6">
            <Link
              to="/seasons/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('seasons.create')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {seasons.map(season => {
            const range =
              season.startDate && season.endDate
                ? `${formatDate(season.startDate)} – ${formatDate(season.endDate)}`
                : season.startDate
                  ? `${t('seasons.from')} ${formatDate(season.startDate)}`
                  : season.endDate
                    ? `${t('seasons.until')} ${formatDate(season.endDate)}`
                    : null;

            return (
              <Link
                key={season.id}
                to={season.slug}
                className="block border p-4 rounded-lg hover:border-blue-500 hover:shadow-md transition duration-150"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-blue-600">{season.name}</h2>
                    {range && <p className="text-xs text-gray-500 mt-1">{range}</p>}
                    {season.description && (
                      <p className="text-gray-600 mt-2 line-clamp-2">{season.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end ml-4 flex-shrink-0">
                    <div className="text-sm text-gray-500">
                      {season._count.practiceSessions}{' '}
                      {season._count.practiceSessions === 1
                        ? t('seasons.session')
                        : t('seasons.sessions')}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
