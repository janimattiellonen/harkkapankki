import { useState } from 'react';
import { Form, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/Button';

const MIN_SESSIONS = 1;
const MAX_SESSIONS = 20;
const DEFAULT_TIME_FALLBACK = '17:00';
const DEFAULT_DURATION_FALLBACK = 90;
const DEFAULT_DAY_OF_WEEK_FALLBACK = 3;

export type SessionRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

type SeasonDefaults = {
  startDate: Date | string | null;
  endDate: Date | string | null;
  defaultDayOfWeek: number | null;
  defaultStartTime: string | null;
  defaultDurationMin: number | null;
};

type AddSessionsFormProps = {
  season: SeasonDefaults;
  cancelHref: string;
  submitText: string;
  initialCount?: number;
  errors?: Record<string, string>;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor((total / 60) % 24);
  const newM = total % 60;
  return `${pad(newH)}:${pad(newM)}`;
}

function diffMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function nextOccurrenceOfWeekday(fromDate: Date, isoDayOfWeek: number): Date {
  const jsTarget = isoDayOfWeek === 7 ? 0 : isoDayOfWeek;
  const result = new Date(fromDate);
  const diff = (jsTarget - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + diff);
  return result;
}

function buildInitialRows(count: number, season: SeasonDefaults): SessionRow[] {
  const startTime = season.defaultStartTime || DEFAULT_TIME_FALLBACK;
  const duration = season.defaultDurationMin || DEFAULT_DURATION_FALLBACK;
  const dayOfWeek = season.defaultDayOfWeek || DEFAULT_DAY_OF_WEEK_FALLBACK;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const seasonStart = season.startDate ? new Date(season.startDate) : null;
  const fromDate = seasonStart && seasonStart > today ? seasonStart : today;
  let cursor = nextOccurrenceOfWeekday(fromDate, dayOfWeek);

  const rows: SessionRow[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: crypto.randomUUID(),
      date: formatDate(cursor),
      startTime,
      endTime: addMinutes(startTime, duration),
    });
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 7);
  }
  return rows;
}

export default function AddSessionsForm({
  season,
  cancelHref,
  submitText,
  initialCount = 3,
  errors,
}: AddSessionsFormProps) {
  const { t } = useTranslation();
  const initialRows = buildInitialRows(initialCount, season);
  const [count, setCount] = useState(initialCount);
  const [rows, setRows] = useState<SessionRow[]>(initialRows);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleCountChange = (raw: string) => {
    const next = Number(raw);
    if (!Number.isFinite(next) || next < MIN_SESSIONS || next > MAX_SESSIONS) return;
    setCount(next);
    if (next > rows.length) {
      const additional = next - rows.length;
      const lastRow = rows[rows.length - 1];
      const baseDate = lastRow ? new Date(lastRow.date) : new Date();
      const startTime = lastRow?.startTime || season.defaultStartTime || DEFAULT_TIME_FALLBACK;
      const duration = lastRow
        ? diffMinutes(lastRow.startTime, lastRow.endTime)
        : season.defaultDurationMin || DEFAULT_DURATION_FALLBACK;
      const newRows: SessionRow[] = [];
      for (let i = 1; i <= additional; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + 7 * i);
        newRows.push({
          id: crypto.randomUUID(),
          date: formatDate(d),
          startTime,
          endTime: addMinutes(startTime, duration > 0 ? duration : DEFAULT_DURATION_FALLBACK),
        });
      }
      setRows([...rows, ...newRows]);
    } else if (next < rows.length) {
      setRows(rows.slice(0, next));
    }
  };

  const handleRegenerate = () => {
    setRows(buildInitialRows(count, season));
  };

  const updateRow = (id: string, updates: Partial<SessionRow>) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleStartTimeChange = (id: string, newStart: string) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const duration = diffMinutes(r.startTime, r.endTime);
        return {
          ...r,
          startTime: newStart,
          endTime: addMinutes(
            newStart,
            duration > 0 ? duration : season.defaultDurationMin || DEFAULT_DURATION_FALLBACK
          ),
        };
      })
    );
  };

  const removeRow = (id: string) => {
    setRows(prev => {
      const next = prev.filter(r => r.id !== id);
      setCount(next.length);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (rows.length === 0) {
      e.preventDefault();
      setClientError(t('addSessions.atLeastOne'));
      return;
    }
    for (const row of rows) {
      if (!row.date || !row.startTime || !row.endTime) {
        e.preventDefault();
        setClientError(t('addSessions.allFieldsRequired'));
        return;
      }
      if (diffMinutes(row.startTime, row.endTime) <= 0) {
        e.preventDefault();
        setClientError(t('addSessions.endAfterStart'));
        return;
      }
    }
    setClientError(null);
  };

  return (
    <Form method="post" onSubmit={handleSubmit} noValidate>
      <fieldset className="mb-6 rounded border border-gray-200 p-4">
        <legend className="px-2 text-lg font-semibold">{t('addSessions.section')}</legend>

        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="sessionCount" className="mb-1 block text-sm font-medium">
              {t('addSessions.howMany')}
            </label>
            <input
              type="number"
              id="sessionCount"
              min={MIN_SESSIONS}
              max={MAX_SESSIONS}
              value={count}
              onChange={e => handleCountChange(e.target.value)}
              className="w-24 rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={handleRegenerate}
            className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            {t('addSessions.regenerate')}
          </button>
        </div>

        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left font-medium text-gray-700">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">{t('addSessions.date')}</th>
                  <th className="py-2 pr-4">{t('addSessions.startTime')}</th>
                  <th className="py-2 pr-4">{t('addSessions.endTime')}</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className="border-b">
                    <td className="py-2 pr-4 text-gray-500">{idx + 1}</td>
                    <td className="py-2 pr-4">
                      <input
                        type="date"
                        value={row.date}
                        onChange={e => updateRow(row.id, { date: e.target.value })}
                        className="rounded border border-gray-300 px-2 py-1"
                        aria-label={t('addSessions.rowDate', { index: idx + 1 })}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="time"
                        value={row.startTime}
                        onChange={e => handleStartTimeChange(row.id, e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1"
                        aria-label={t('addSessions.rowStartTime', { index: idx + 1 })}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="time"
                        value={row.endTime}
                        onChange={e => updateRow(row.id, { endTime: e.target.value })}
                        className="rounded border border-gray-300 px-2 py-1"
                        aria-label={t('addSessions.rowEndTime', { index: idx + 1 })}
                      />
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
                        aria-label={t('addSessions.removeRow', { index: idx + 1 })}
                      >
                        {t('addSessions.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600">{t('addSessions.empty')}</p>
        )}

        {clientError && <p className="mt-2 text-sm text-red-600">{clientError}</p>}
        {errors?.rows && <p className="mt-2 text-sm text-red-600">{errors.rows}</p>}
      </fieldset>

      <input type="hidden" name="rows" value={JSON.stringify(rows)} />

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
