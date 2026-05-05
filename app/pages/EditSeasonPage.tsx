import { useTranslation } from 'react-i18next';
import SeasonForm from '~/components/SeasonForm';

type EditableSeason = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  defaultDayOfWeek: number | null;
  defaultStartTime: string | null;
  defaultDurationMin: number | null;
};

type EditSeasonPageProps = {
  season: EditableSeason;
  actionData?: {
    errors?: Record<string, string>;
    values?: Record<string, unknown>;
  };
};

function toDateInputValue(value: Date | string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function EditSeasonPage({ season, actionData }: EditSeasonPageProps) {
  const { t } = useTranslation();

  const errors = actionData?.errors;
  const submitted = actionData?.values;

  const defaults = submitted
    ? {
        name: typeof submitted.name === 'string' ? submitted.name : season.name,
        description:
          typeof submitted.description === 'string' ? submitted.description : season.description,
        startDate:
          typeof submitted.startDate === 'string'
            ? submitted.startDate
            : toDateInputValue(season.startDate),
        endDate:
          typeof submitted.endDate === 'string'
            ? submitted.endDate
            : toDateInputValue(season.endDate),
        defaultDayOfWeek:
          typeof submitted.defaultDayOfWeek === 'string' && submitted.defaultDayOfWeek !== ''
            ? Number(submitted.defaultDayOfWeek)
            : season.defaultDayOfWeek,
        defaultStartTime:
          typeof submitted.defaultStartTime === 'string'
            ? submitted.defaultStartTime
            : season.defaultStartTime,
        defaultDurationMin:
          typeof submitted.defaultDurationMin === 'string' && submitted.defaultDurationMin !== ''
            ? Number(submitted.defaultDurationMin)
            : season.defaultDurationMin,
      }
    : {
        name: season.name,
        description: season.description,
        startDate: toDateInputValue(season.startDate),
        endDate: toDateInputValue(season.endDate),
        defaultDayOfWeek: season.defaultDayOfWeek,
        defaultStartTime: season.defaultStartTime,
        defaultDurationMin: season.defaultDurationMin,
      };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">{t('seasons.editSeasonTitle')}</h1>
      <SeasonForm
        defaults={defaults}
        errors={errors}
        submitText={t('seasons.save')}
        cancelHref={`/seasons/${season.slug}`}
      />
    </div>
  );
}
