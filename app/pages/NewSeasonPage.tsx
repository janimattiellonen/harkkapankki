import { useTranslation } from 'react-i18next';
import SeasonForm from '~/components/SeasonForm';

type NewSeasonPageProps = {
  actionData?: {
    errors?: Record<string, string>;
    values?: Record<string, unknown>;
  };
};

export default function NewSeasonPage({ actionData }: NewSeasonPageProps) {
  const { t } = useTranslation();
  const errors = actionData?.errors;
  const values = actionData?.values;

  const defaults = values
    ? {
        name: typeof values.name === 'string' ? values.name : undefined,
        description: typeof values.description === 'string' ? values.description : undefined,
        startDate: typeof values.startDate === 'string' ? values.startDate : undefined,
        endDate: typeof values.endDate === 'string' ? values.endDate : undefined,
        defaultDayOfWeek:
          typeof values.defaultDayOfWeek === 'string' && values.defaultDayOfWeek !== ''
            ? Number(values.defaultDayOfWeek)
            : undefined,
        defaultStartTime:
          typeof values.defaultStartTime === 'string' ? values.defaultStartTime : undefined,
        defaultDurationMin:
          typeof values.defaultDurationMin === 'string' && values.defaultDurationMin !== ''
            ? Number(values.defaultDurationMin)
            : undefined,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">{t('seasons.newSeasonTitle')}</h1>
      <SeasonForm
        defaults={defaults}
        errors={errors}
        submitText={t('seasons.create')}
        cancelHref="/seasons"
      />
    </div>
  );
}
