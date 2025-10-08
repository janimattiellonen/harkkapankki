import { useState } from 'react';
import { Form } from '@remix-run/react';
import type { PractiseLength, SelectedItem, Section, SectionItem } from '~/types';
import { PractiseSessionLengthSelector } from '~/components/PractiseSessionLengthSelector';
import { PractiseSessionSection } from '~/components/PractiseSessionSection';
import { PractiseSessionSummary } from '~/components/PractiseSessionSummary';

type PracticeSessionData = {
  id: string;
  name: string | null;
  description: string | null;
  sessionLength: number;
  sectionItems: Array<{
    id: string;
    order: number;
    section: {
      id: string;
    };
    exerciseType: {
      id: string;
    };
  }>;
};

type EditPractiseSessionPageProps = {
  session: PracticeSessionData;
  sections: Section[];
};

export default function EditPractiseSessionPage({
  session,
  sections,
}: EditPractiseSessionPageProps) {
  // Initialize with existing session data
  const initialSelectedItems: SelectedItem[] = session.sectionItems.map(item => ({
    sectionId: item.section.id,
    itemValue: item.exerciseType.id,
  }));

  const [practiseLength, setPractiseLength] = useState<PractiseLength>(
    session.sessionLength as PractiseLength
  );
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(initialSelectedItems);
  const [name, setName] = useState<string>(session.name || '');
  const [description, setDescription] = useState<string>(session.description || '');
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
  const getSectionItems = (sectionId: string): SectionItem[] => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return [];

    return selectedItems
      .filter(item => item.sectionId === sectionId)
      .map(item => {
        const sectionItem = section.items.find(i => i.value === item.itemValue);
        return sectionItem!;
      })
      .filter(Boolean);
  };

  // Add item to section
  const handleAddItem = (sectionId: string, item: SectionItem) => {
    setSelectedItems(prev => [...prev, { sectionId, itemValue: item.value }]);
  };

  // Remove item from section
  const handleRemoveItem = (sectionId: string, itemValue: string) => {
    setSelectedItems(prev =>
      prev.filter(item => !(item.sectionId === sectionId && item.itemValue === itemValue))
    );
  };

  const totalAllocated = calculateTotalTime();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const newErrors: { name?: string; items?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Session name is required';
    }

    if (selectedItems.length === 0) {
      newErrors.items = 'Please select at least one item in any section';
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
    // TODO: Implement delete functionality
    console.log('Delete confirmed');
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Edit Practice Session</h1>

      <Form method="post" onSubmit={handleSubmit}>
        {/* Name and Description */}
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Session Name <span className="text-red-500">*</span>
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
              placeholder="e.g., Morning practice session"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this session..."
            />
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
                selectedItems={getSectionItems(section.id)}
                onAddItem={item => handleAddItem(section.id, item)}
                onRemoveItem={itemValue => handleRemoveItem(section.id, itemValue)}
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
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Practise Session
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Practice Session
            </button>
          </div>
        </div>
      </Form>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Delete Practice Session</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this practice session? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
