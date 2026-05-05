import { useState } from 'react';
import type { MetaFunction } from 'react-router';
import { Button } from '~/components/Button';

export const meta: MetaFunction = () => {
  return [{ title: 'Season form prototype - Harkkapankki' }];
};

const ISO_WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const MIN_SESSIONS = 1;
const MAX_SESSIONS = 20;

type SessionRow = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
};

type DefaultsForRowGeneration = {
  startDate: string;
  defaultDayOfWeek: number;
  defaultStartTime: string;
  defaultDurationMin: number;
};

type FormErrors = {
  name?: string;
  endDate?: string;
  rows?: string;
};

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor((total / 60) % 24);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function diffMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

// Find the next occurrence of an ISO day-of-week (1=Mon, 7=Sun) on or after a given date.
function nextOccurrenceOfWeekday(fromDate: Date, isoDayOfWeek: number): Date {
  const jsTarget = isoDayOfWeek === 7 ? 0 : isoDayOfWeek;
  const result = new Date(fromDate);
  const diff = (jsTarget - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + diff);
  return result;
}

function buildInitialRows(count: number, defaults: DefaultsForRowGeneration): SessionRow[] {
  const rows: SessionRow[] = [];
  const startDateObj = defaults.startDate ? new Date(defaults.startDate) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fromDate = startDateObj > today ? startDateObj : today;
  let cursorDate = nextOccurrenceOfWeekday(fromDate, defaults.defaultDayOfWeek);
  for (let i = 0; i < count; i++) {
    rows.push({
      id: crypto.randomUUID(),
      date: formatDate(cursorDate),
      startTime: defaults.defaultStartTime,
      endTime: addMinutes(defaults.defaultStartTime, defaults.defaultDurationMin),
    });
    cursorDate = new Date(cursorDate);
    cursorDate.setDate(cursorDate.getDate() + 7);
  }
  return rows;
}

const INITIAL_DEFAULTS: DefaultsForRowGeneration = {
  startDate: '',
  defaultDayOfWeek: 3,
  defaultStartTime: '17:00',
  defaultDurationMin: 90,
};
const INITIAL_COUNT = 3;

export default function SeasonFormPrototype() {
  // Season metadata
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [defaultDayOfWeek, setDefaultDayOfWeek] = useState<number>(
    INITIAL_DEFAULTS.defaultDayOfWeek
  );
  const [defaultStartTime, setDefaultStartTime] = useState(INITIAL_DEFAULTS.defaultStartTime);
  const [defaultDurationMin, setDefaultDurationMin] = useState<60 | 90>(90);

  // Initial sessions
  const [sessionCount, setSessionCount] = useState(INITIAL_COUNT);
  const [rows, setRows] = useState<SessionRow[]>(() =>
    buildInitialRows(INITIAL_COUNT, INITIAL_DEFAULTS)
  );

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const currentDefaults: DefaultsForRowGeneration = {
    startDate,
    defaultDayOfWeek,
    defaultStartTime,
    defaultDurationMin,
  };

  const handleCountChange = (rawValue: string) => {
    const newCount = Number(rawValue);
    if (!Number.isFinite(newCount) || newCount < MIN_SESSIONS || newCount > MAX_SESSIONS) {
      return;
    }
    setSessionCount(newCount);
    if (newCount > rows.length) {
      const additional = newCount - rows.length;
      const lastRow = rows[rows.length - 1];
      const baseDate = lastRow ? new Date(lastRow.date) : new Date();
      const newRows: SessionRow[] = [];
      for (let i = 1; i <= additional; i++) {
        const next = new Date(baseDate);
        next.setDate(next.getDate() + 7 * i);
        newRows.push({
          id: crypto.randomUUID(),
          date: formatDate(next),
          startTime: defaultStartTime,
          endTime: addMinutes(defaultStartTime, defaultDurationMin),
        });
      }
      setRows([...rows, ...newRows]);
    } else if (newCount < rows.length) {
      setRows(rows.slice(0, newCount));
    }
  };

  const handleRegenerate = () => {
    setRows(buildInitialRows(sessionCount, currentDefaults));
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
          endTime: addMinutes(newStart, duration > 0 ? duration : defaultDurationMin),
        };
      })
    );
  };

  const removeRow = (id: string) => {
    setRows(prev => {
      const next = prev.filter(r => r.id !== id);
      setSessionCount(next.length);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'End date must be on or after start date';
    }
    if (rows.length === 0) {
      newErrors.rows = 'At least one session is required';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmittedMessage(null);
      return;
    }
    setErrors({});
    setSubmittedMessage(
      `(prototype) Would create season "${name}" with ${rows.length} initial session${rows.length === 1 ? '' : 's'}.`
    );
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 rounded border border-amber-500 bg-amber-50 p-4">
        <p className="font-semibold text-amber-800">UI prototype</p>
        <p className="text-sm text-amber-700">
          Use this page to play with the form ergonomics for the &ldquo;Create season + N initial
          sessions&rdquo; flow. <strong>Submitting does not save anything to the database.</strong>
        </p>
      </div>

      <h1 className="mb-6 text-3xl font-bold">Create new season</h1>

      {submittedMessage && (
        <div
          role="status"
          className="mb-6 rounded border border-green-500 bg-green-50 p-4 text-green-900"
        >
          {submittedMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="mb-6 rounded border border-gray-200 p-4">
          <legend className="px-2 text-lg font-semibold">Season details</legend>

          <div className="mb-4">
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Spring 2026"
              className={`w-full rounded border px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Beginners group, autumn season"
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
                Start date (optional)
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
                End date (optional)
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className={`w-full rounded border px-3 py-2 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="defaultDayOfWeek" className="mb-1 block text-sm font-medium">
                Default day of week
              </label>
              <select
                id="defaultDayOfWeek"
                value={defaultDayOfWeek}
                onChange={e => setDefaultDayOfWeek(Number(e.target.value))}
                className="w-full rounded border border-gray-300 px-3 py-2"
              >
                {ISO_WEEKDAYS.map(d => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="defaultStartTime" className="mb-1 block text-sm font-medium">
                Default start time
              </label>
              <input
                type="time"
                id="defaultStartTime"
                value={defaultStartTime}
                onChange={e => setDefaultStartTime(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="defaultDurationMin" className="mb-1 block text-sm font-medium">
                Default duration
              </label>
              <select
                id="defaultDurationMin"
                value={defaultDurationMin}
                onChange={e => setDefaultDurationMin(Number(e.target.value) as 60 | 90)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              >
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="mb-6 rounded border border-gray-200 p-4">
          <legend className="px-2 text-lg font-semibold">Initial sessions</legend>

          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="sessionCount" className="mb-1 block text-sm font-medium">
                How many sessions to create?
              </label>
              <input
                type="number"
                id="sessionCount"
                min={MIN_SESSIONS}
                max={MAX_SESSIONS}
                value={sessionCount}
                onChange={e => handleCountChange(e.target.value)}
                className="w-24 rounded border border-gray-300 px-3 py-2"
              />
            </div>
            <button
              type="button"
              onClick={handleRegenerate}
              className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Regenerate from defaults
            </button>
          </div>

          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left font-medium text-gray-700">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Start time</th>
                    <th className="py-2 pr-4">End time</th>
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
                          aria-label={`Session ${idx + 1} date`}
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={e => handleStartTimeChange(row.id, e.target.value)}
                          className="rounded border border-gray-300 px-2 py-1"
                          aria-label={`Session ${idx + 1} start time`}
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={e => updateRow(row.id, { endTime: e.target.value })}
                          className="rounded border border-gray-300 px-2 py-1"
                          aria-label={`Session ${idx + 1} end time`}
                        />
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
                          aria-label={`Remove session ${idx + 1}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No sessions yet. Set a count above to populate initial rows.
            </p>
          )}

          {errors.rows && <p className="mt-2 text-sm text-red-600">{errors.rows}</p>}
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit">Create season + sessions</Button>
        </div>
      </form>
    </div>
  );
}
