import { useState } from 'react';
import type { Section, SectionItem, PractiseLength } from '~/types';

type PractiseSessionSectionProps = {
  section: Section;
  practiseLength: PractiseLength;
  selectedItems: SectionItem[];
  onAddItem: (item: SectionItem) => void;
  onRemoveItem: (itemValue: string) => void;
};

export function PractiseSessionSection({
  section,
  practiseLength,
  selectedItems,
  onAddItem,
  onRemoveItem,
}: PractiseSessionSectionProps) {
  const [selectedValue, setSelectedValue] = useState<string>('');

  // Get section duration based on practise length
  const duration =
    typeof section.duration === 'number' ? section.duration : section.duration[practiseLength];

  // Get available items (exclude already selected)
  const availableItems = section.items.filter(
    item => !selectedItems.some(selected => selected.value === item.value)
  );

  const handleAdd = () => {
    if (!selectedValue) return;

    const item = section.items.find(i => i.value === selectedValue);
    if (item) {
      onAddItem(item);
      setSelectedValue('');
    }
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{section.name}</h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {duration} min
        </span>
      </div>

      {/* Item selector */}
      <div className="mb-3 flex gap-2">
        <select
          value={selectedValue}
          onChange={e => setSelectedValue(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          disabled={availableItems.length === 0}
        >
          <option value="">
            {availableItems.length === 0 ? 'No items available' : 'Select item...'}
          </option>
          {availableItems.map(item => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedValue}
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* Selected items list */}
      {selectedItems.length > 0 && (
        <ul className="space-y-2">
          {selectedItems.map(item => (
            <li
              key={item.value}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
            >
              <span className="text-gray-700">• {item.label}</span>
              <button
                type="button"
                onClick={() => onRemoveItem(item.value)}
                className="text-red-600 hover:text-red-800 font-bold"
                aria-label={`Remove ${item.label}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedItems.length === 0 && (
        <p className="text-sm text-gray-500 italic">No items selected</p>
      )}
    </div>
  );
}
