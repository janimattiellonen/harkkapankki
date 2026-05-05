import { useState } from 'react';
import { Form, Link, useSubmit } from 'react-router';
import type { PractiseLength, SelectedItem, Section } from '~/types';
import { PractiseSessionLengthSelector } from '~/components/PractiseSessionLengthSelector';
import { PractiseSessionSection } from '~/components/PractiseSessionSection';
import { PractiseSessionSummary } from '~/components/PractiseSessionSummary';
import { Button } from '~/components/Button';
import { useTranslation } from 'react-i18next';
import { utcToHelsinkiDateString, utcToHelsinkiTimeString } from '~/utils/timezone';

type PracticeSessionData = {
  id: string;
  name: string | null;
  description: string | null;
  sessionLength: number;
  scheduledAt: Date | string | null;
  season: { slug: string; name: string } | null;
  sectionItems: Array<{
    id: string;
    order: number;
    section: {
      id: string;
    };
    exerciseType: {
      id: string;
      translations: Array<{ name: string }>;
    };
    exercise?: {
      id: string;
      name: string;
    } | null;
  }>;
};

type EditPractiseSessionPageProps = {
  session: PracticeSessionData;
  sections: Section[];
};

function scheduledAtToInputs(value: Date | string | null): { date: string; time: string } {
  if (!value) return { date: '', time: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return { date: utcToHelsinkiDateString(d), time: utcToHelsinkiTimeString(d) };
}

export default function EditPractiseSessionPage({
  session,
  sections,
}: EditPractiseSessionPageProps) {
  const { t } = useTranslation();
  const submit = useSubmit();
  // Initialize with existing session data, including exercise info if present
  const initialSelectedItems: SelectedItem[] = session.sectionItems.map(item => ({
    sectionId: item.section.id,
    itemValue: item.exerciseType.id,
    ...(item.exercise && {
      exerciseId: item.exercise.id,
      exerciseLabel: item.exercise.name,
    }),
  }));

  const [practiseLength, setPractiseLength] = useState<PractiseLength>(
    session.sessionLength as PractiseLength
  );
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(initialSelectedItems);
  const [name, setName] = useState<string>(session.name || '');
  const [description, setDescription] = useState<string>(session.description || '');
  const initialScheduled = scheduledAtToInputs(session.scheduledAt);
  const [scheduledDate, setScheduledDate] = useState<string>(initialScheduled.date);
  const [scheduledTime, setScheduledTime] = useState<string>(initialScheduled.time);
  const [errors, setErrors] = useState<{ name?: string; items?: string }>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get section duration based on practise length
  const getSectionDuration = (section: Section): number => {
    return typeof section.duration === 'number'
      ? section.duration
      : section.duration[practiseLength];
  };

  // Calculate total allocated time
  const calculateTotalTime = (): number => {
    return sections.reduce((total, section) => {
      const hasSelectedItems = selectedItems.some(item => item.sectionId === section.id);
      return hasSelectedItems ? total + getSectionDuration(section) : total;
    }, 0);
  };

  // Get selected items for a specific section
  const getSectionSelectedItems = (sectionId: string): SelectedItem[] => {
    return selectedItems.filter(item => item.sectionId === sectionId);
  };

  // Add item to section
  const handleAddItem = (item: SelectedItem) => {
    setSelectedItems(prev => [...prev, item]);
  };

  // Remove item from section
  const handleRemoveItem = (sectionId: string, itemValue: string, exerciseId?: string) => {
    setSelectedItems(prev =>
      prev.filter(item => {
        if (item.sectionId !== sectionId) return true;
        if (item.itemValue !== itemValue) return true;
        if (exerciseId) return item.exerciseId !== exerciseId;
        return false;
      })
    );
  };

  const totalAllocated = calculateTotalTime();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const newErrors: { name?: string; items?: string } = {};

    if (!name.trim()) {
      newErrors.name = t('sessions.sessionNameRequired');
    }

    if (selectedItems.length === 0) {
      newErrors.items = t('sessions.selectAtLeastOne');
    }

    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      return;
    }

    setErrors({});
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    submit({ intent: 'delete' }, { method: 'post' });
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">{t('sessions.edit')}</h1>

      <Form method="post" onSubmit={handleSubmit}>
        {session.season && (
          <div className="mb-6 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            {t('sessions.partOfSeason')}{' '}
            <Link
              to={`/seasons/${session.season.slug}`}
              className="font-semibold underline hover:text-blue-700"
            >
              {session.season.name}
            </Link>
          </div>
        )}

        {/* Name and Description */}
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('sessions.sessionName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('sessions.sessionPlaceholder')}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('sessions.descriptionOptional')}
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('sessions.descriptionPlaceholder')}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="scheduledDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('sessions.scheduledDateOptional')}
              </label>
              <input
                type="date"
                id="scheduledDate"
                name="scheduledDate"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="scheduledTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('sessions.scheduledTimeOptional')}
              </label>
              <input
                type="time"
                id="scheduledTime"
                name="scheduledTime"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Length Selector */}
        <PractiseSessionLengthSelector
          selectedLength={practiseLength}
          onLengthChange={setPractiseLength}
        />

        {/* Hidden inputs for form data */}
        <input type="hidden" name="sessionLength" value={practiseLength} />
        <input type="hidden" name="selectedItems" value={JSON.stringify(selectedItems)} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sections */}
          <div className="lg:col-span-2 space-y-4">
            {sections.map(section => (
              <PractiseSessionSection
                key={section.id}
                section={section}
                practiseLength={practiseLength}
                selectedItems={getSectionSelectedItems(section.id)}
                onAddItem={handleAddItem}
                onRemoveItem={(itemValue, exerciseId) =>
                  handleRemoveItem(section.id, itemValue, exerciseId)
                }
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PractiseSessionSummary
                practiseLength={practiseLength}
                totalAllocated={totalAllocated}
              />
            </div>
          </div>
        </div>

        {/* Save and Delete Buttons */}
        <div className="mt-6">
          {errors.items && <p className="text-sm text-red-600 mb-2">{errors.items}</p>}
          <div className="flex justify-between">
            <Button type="button" variant="danger" onClick={handleDeleteClick}>
              {t('sessions.delete')}
            </Button>
            <Button type="submit">{t('sessions.update')}</Button>
          </div>
        </div>
      </Form>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{t('sessions.delete')}</h2>
            <p className="text-gray-700 mb-6">{t('sessions.deleteConfirm')}</p>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleDeleteCancel}>
                {t('common.cancel')}
              </Button>
              <Button type="button" variant="danger" onClick={handleDeleteConfirm}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
