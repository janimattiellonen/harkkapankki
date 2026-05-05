import { Form, Link, useNavigation, useSearchParams } from 'react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/Button';
import type { SeasonHints } from '~/services/seasonHints.server';

type SeasonPracticeSession = {
  id: string;
  slug: string;
  name: string | null;
  scheduledAt: Date | string | null;
  sessionLength: number;
};

type SeasonDetailData = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  defaultDayOfWeek: number | null;
  defaultStartTime: string | null;
  defaultDurationMin: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  practiceSessions: SeasonPracticeSession[];
};

type SeasonDetailPageProps = {
  season: SeasonDetailData;
  hints: SeasonHints | null;
};

export default function SeasonDetailPage({ season, hints }: SeasonDetailPageProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const warningCount = Number(searchParams.get('warnings') ?? '0');
  const totalHints = hints
    ? hints.staleTypes.length + hints.recentRepeats.length + hints.lowDiversitySections.length
    : 0;
  const isDeleting = navigation.state !== 'idle' && navigation.formData?.get('intent') === 'delete';

  const formatDate = (value: Date | string | null) =>
    value ? new Date(value).toLocaleDateString('fi-FI') : '—';

  const dayOfWeekLabel =
    season.defaultDayOfWeek !== null ? t(`seasons.weekdays.${season.defaultDayOfWeek}`) : '—';

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/seasons"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          {t('seasons.backToSeasons')}
        </Link>
        <div className="flex flex-wrap justify-between items-start mt-2 gap-3">
          <h1 className="text-3xl font-bold">{season.name}</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/seasons/${season.slug}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('seasons.editSeason')}
            </Link>
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              {t('seasons.delete')}
            </Button>
          </div>
        </div>
      </div>

      {season.description && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">{t('seasons.description')}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{season.description}</p>
        </div>
      )}

      <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded border border-gray-200 p-3">
          <dt className="text-xs uppercase text-gray-500">{t('seasons.startDate')}</dt>
          <dd className="mt-1">{formatDate(season.startDate)}</dd>
        </div>
        <div className="rounded border border-gray-200 p-3">
          <dt className="text-xs uppercase text-gray-500">{t('seasons.endDate')}</dt>
          <dd className="mt-1">{formatDate(season.endDate)}</dd>
        </div>
        <div className="rounded border border-gray-200 p-3">
          <dt className="text-xs uppercase text-gray-500">{t('seasons.defaultDayOfWeek')}</dt>
          <dd className="mt-1">{dayOfWeekLabel}</dd>
        </div>
        <div className="rounded border border-gray-200 p-3">
          <dt className="text-xs uppercase text-gray-500">{t('seasons.defaultStartTime')}</dt>
          <dd className="mt-1">{season.defaultStartTime ?? '—'}</dd>
        </div>
        <div className="rounded border border-gray-200 p-3">
          <dt className="text-xs uppercase text-gray-500">{t('seasons.defaultDuration')}</dt>
          <dd className="mt-1">
            {season.defaultDurationMin
              ? `${season.defaultDurationMin} ${t('common.minutes')}`
              : '—'}
          </dd>
        </div>
      </dl>

      {warningCount > 0 && (
        <div
          role="status"
          className="mb-4 rounded border border-amber-500 bg-amber-50 p-4 text-amber-900"
        >
          {t('addSessions.warningBanner', { count: warningCount })}
        </div>
      )}

      {totalHints > 0 && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-4 text-amber-900 flex items-center justify-between gap-4">
          <span>{t('hints.banner', { count: totalHints })}</span>
          <Link
            to={`/seasons/${season.slug}/coverage`}
            className="font-semibold underline hover:text-amber-800 whitespace-nowrap"
          >
            {t('hints.bannerLink')}
          </Link>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">{t('seasons.practiceSessions')}</h2>
          <div className="flex items-center gap-2">
            <Link
              to={`/seasons/${season.slug}/coverage`}
              className="inline-flex items-center rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              {t('coverage.cta')}
            </Link>
            <Link
              to={`/seasons/${season.slug}/add-sessions`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('addSessions.cta')}
            </Link>
          </div>
        </div>
        {season.practiceSessions.length === 0 ? (
          <p className="text-gray-500">{t('seasons.noPracticeSessions')}</p>
        ) : (
          <ul className="space-y-2">
            {season.practiceSessions.map(session => (
              <li key={session.id} className="rounded border border-gray-200 p-3">
                <Link
                  to={`/practise-sessions/${session.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {session.name || t('sessions.untitledSession')}
                </Link>
                <span className="ml-3 text-sm text-gray-500">
                  {session.scheduledAt
                    ? new Date(session.scheduledAt).toLocaleDateString('fi-FI')
                    : t('seasons.unscheduled')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('seasons.delete')}</h3>
            <p className="text-gray-600 mb-6">{t('seasons.deleteConfirm')}</p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                {t('common.cancel')}
              </Button>
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <Button type="submit" variant="danger" disabled={isDeleting}>
                  {t('seasons.delete')}
                </Button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
