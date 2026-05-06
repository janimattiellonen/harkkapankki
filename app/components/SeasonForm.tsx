import { useState } from 'react';
import { Form, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/Button';

const ISO_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

type SeasonFormDefaults = {
  name?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  defaultDayOfWeek?: number | null;
  defaultStartTime?: string | null;
  defaultDurationMin?: number | null;
};

type SeasonFormProps = {
  defaults?: SeasonFormDefaults;
  errors?: Record<string, string>;
  submitText: string;
  cancelHref: string;
};

export default function SeasonForm({ defaults, errors, submitText, cancelHref }: SeasonFormProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(defaults?.name ?? '');
  const [description, setDescription] = useState(defaults?.description ?? '');
  const [startDate, setStartDate] = useState(defaults?.startDate ?? '');
  const [endDate, setEndDate] = useState(defaults?.endDate ?? '');
  const [defaultDayOfWeek, setDefaultDayOfWeek] = useState<string>(
    defaults?.defaultDayOfWeek ? String(defaults.defaultDayOfWeek) : ''
  );
  const [defaultStartTime, setDefaultStartTime] = useState(defaults?.defaultStartTime ?? '');
  const [defaultDurationMin, setDefaultDurationMin] = useState<string>(
    defaults?.defaultDurationMin ? String(defaults.defaultDurationMin) : ''
  );

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const next: Record<string, string> = {};
    if (!name.trim()) {
      next.name = t('seasons.nameRequired');
    }
    if (startDate && endDate && endDate < startDate) {
      next.endDate = t('seasons.endDateAfterStartDate');
    }
    if (Object.keys(next).length > 0) {
      e.preventDefault();
      setClientErrors(next);
      return;
    }
    setClientErrors({});
  };

  const fieldError = (field: string): string | undefined => clientErrors[field] ?? errors?.[field];

  const startDateIsInPast = ((): boolean => {
    if (!startDate) {
      return false;
    }
    const parsed = new Date(startDate);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed < today;
  })();

  return (
    <Form method="post" onSubmit={handleSubmit} noValidate>
      <fieldset className="mb-6 rounded border border-gray-200 p-4 min-w-0">
        <legend className="px-2 text-lg font-semibold">{t('seasons.detailsSection')}</legend>

        <div className="mb-4">
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            {t('seasons.name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('seasons.namePlaceholder')}
            className={`w-full rounded border px-3 py-2 ${
              fieldError('name') ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {fieldError('name') && <p className="mt-1 text-sm text-red-600">{fieldError('name')}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            {t('seasons.descriptionOptional')}
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            placeholder={t('seasons.descriptionPlaceholder')}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {fieldError('description') && (
            <p className="mt-1 text-sm text-red-600">{fieldError('description')}</p>
          )}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
              {t('seasons.startDateOptional')}
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={`w-full rounded border px-3 py-2 ${
                fieldError('startDate') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldError('startDate') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('startDate')}</p>
            )}
            {!fieldError('startDate') && startDateIsInPast && (
              <p className="mt-1 text-sm text-amber-700">{t('seasons.startDateInPast')}</p>
            )}
          </div>
          <div>
            <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
              {t('seasons.endDateOptional')}
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={`w-full rounded border px-3 py-2 ${
                fieldError('endDate') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldError('endDate') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('endDate')}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="defaultDayOfWeek" className="mb-1 block text-sm font-medium">
              {t('seasons.defaultDayOfWeek')}
            </label>
            <select
              id="defaultDayOfWeek"
              name="defaultDayOfWeek"
              value={defaultDayOfWeek}
              onChange={e => setDefaultDayOfWeek(e.target.value)}
              className="h-10 w-full rounded border border-gray-300 px-3"
            >
              <option value="">{t('seasons.notSet')}</option>
              {ISO_WEEKDAYS.map(day => (
                <option key={day} value={day}>
                  {t(`seasons.weekdays.${day}`)}
                </option>
              ))}
            </select>
            {fieldError('defaultDayOfWeek') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('defaultDayOfWeek')}</p>
            )}
          </div>
          <div>
            <label htmlFor="defaultStartTime" className="mb-1 block text-sm font-medium">
              {t('seasons.defaultStartTime')}
            </label>
            <input
              type="time"
              id="defaultStartTime"
              name="defaultStartTime"
              value={defaultStartTime}
              onChange={e => setDefaultStartTime(e.target.value)}
              className="h-10 w-full rounded border border-gray-300 px-3"
            />
            {fieldError('defaultStartTime') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('defaultStartTime')}</p>
            )}
          </div>
          <div>
            <label htmlFor="defaultDurationMin" className="mb-1 block text-sm font-medium">
              {t('seasons.defaultDuration')}
            </label>
            <select
              id="defaultDurationMin"
              name="defaultDurationMin"
              value={defaultDurationMin}
              onChange={e => setDefaultDurationMin(e.target.value)}
              className="h-10 w-full rounded border border-gray-300 px-3"
            >
              <option value="">{t('seasons.notSet')}</option>
              <option value="60">60 {t('common.minutes')}</option>
              <option value="90">90 {t('common.minutes')}</option>
            </select>
            {fieldError('defaultDurationMin') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('defaultDurationMin')}</p>
            )}
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end gap-3">
        <Link
          to={cancelHref}
          className="inline-flex items-center rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          {t('common.cancel')}
        </Link>
        <Button type="submit">{submitText}</Button>
      </div>
    </Form>
  );
}
