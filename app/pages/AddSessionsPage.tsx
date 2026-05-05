import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import AddSessionsForm from '~/components/AddSessionsForm';

type SeasonDefaults = {
  slug: string;
  name: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  defaultDayOfWeek: number | null;
  defaultStartTime: string | null;
  defaultDurationMin: number | null;
};

type AddSessionsPageProps = {
  season: SeasonDefaults;
  actionData?: {
    errors?: Record<string, string>;
  };
};

export default function AddSessionsPage({ season, actionData }: AddSessionsPageProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4">
        <Link
          to={`/seasons/${season.slug}`}
          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
        >
          {t('seasons.backToSeasons')}
        </Link>
      </div>
      <h1 className="mb-2 text-3xl font-bold">{t('addSessions.title')}</h1>
      <p className="mb-6 text-gray-600">{t('addSessions.subtitle', { season: season.name })}</p>

      <AddSessionsForm
        season={season}
        cancelHref={`/seasons/${season.slug}`}
        submitText={t('addSessions.submit')}
        errors={actionData?.errors}
      />
    </div>
  );
}
