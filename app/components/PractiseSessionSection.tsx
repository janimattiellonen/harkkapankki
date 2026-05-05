import * as stylex from '@stylexjs/stylex';
import { color } from '~/styles/tokens.stylex';
import { fontSize, fontWeight } from '~/styles/constants.stylex';
import { useState } from 'react';
import type { Section, PractiseLength, SelectedItem } from '~/types';
import { Button } from '~/components/Button';
import { useTranslation } from 'react-i18next';

type PractiseSessionSectionProps = {
  section: Section;
  practiseLength: PractiseLength;
  selectedItems: SelectedItem[];
  onAddItem: (item: SelectedItem) => void;
  onRemoveItem: (itemValue: string, exerciseId?: string) => void;
};

export function PractiseSessionSection({
  section,
  practiseLength,
  selectedItems,
  onAddItem,
  onRemoveItem,
}: PractiseSessionSectionProps) {
  const { t } = useTranslation();
  const [selectedTypeValue, setSelectedTypeValue] = useState<string>('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');

  // Get section duration based on practise length
  const duration =
    typeof section.duration === 'number' ? section.duration : section.duration[practiseLength];

  // Find the currently selected exercise type
  const selectedType = section.items.find(i => i.value === selectedTypeValue);
  const hasExercises = selectedType?.exercises && selectedType.exercises.length > 0;

  // Get available exercise types (exclude already selected for types without exercises)
  const availableTypes = section.items.filter(item => {
    if (item.exercises && item.exercises.length > 0) {
      // Types with exercises: always show if there are unselected exercises
      const selectedExerciseIds = selectedItems
        .filter(sel => sel.itemValue === item.value && sel.exerciseId)
        .map(sel => sel.exerciseId);
      return item.exercises.some(ex => !selectedExerciseIds.includes(ex.value));
    }
    // Types without exercises: hide if already selected
    return !selectedItems.some(sel => sel.itemValue === item.value);
  });

  // Get available exercises for selected type (exclude already selected)
  const availableExercises = hasExercises
    ? selectedType.exercises!.filter(ex => !selectedItems.some(sel => sel.exerciseId === ex.value))
    : [];

  const handleTypeChange = (value: string) => {
    setSelectedTypeValue(value);
    setSelectedExerciseId('');
  };

  const handleAdd = () => {
    if (!selectedTypeValue) {
      return;
    }

    if (hasExercises) {
      if (!selectedExerciseId) {
        return;
      }
      const exercise = selectedType!.exercises!.find(e => e.value === selectedExerciseId);
      if (exercise) {
        onAddItem({
          sectionId: section.id,
          itemValue: selectedTypeValue,
          exerciseId: exercise.value,
          exerciseLabel: exercise.label,
        });
        setSelectedExerciseId('');
        // Check if there are remaining exercises for this type
        const remainingAfterAdd = availableExercises.filter(ex => ex.value !== selectedExerciseId);
        if (remainingAfterAdd.length === 0) {
          setSelectedTypeValue('');
        }
      }
    } else {
      onAddItem({
        sectionId: section.id,
        itemValue: selectedTypeValue,
      });
      setSelectedTypeValue('');
    }
  };

  const canAdd = hasExercises ? !!selectedExerciseId : !!selectedTypeValue;

  // Build display label for selected items
  const getItemLabel = (item: SelectedItem): string => {
    const type = section.items.find(i => i.value === item.itemValue);
    const typeName = type?.label || item.itemValue;
    if (item.exerciseLabel) {
      return `${typeName}: ${item.exerciseLabel}`;
    }
    return typeName;
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
      <div className="mb-3 flex flex-wrap gap-2">
        <select
          value={selectedTypeValue}
          onChange={e => handleTypeChange(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2"
          disabled={availableTypes.length === 0}
        >
          <option value="">
            {availableTypes.length === 0
              ? t('sections.noItemsAvailable', 'No items available')
              : t('sections.selectItem', 'Select item...')}
          </option>
          {availableTypes.map(item => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        {hasExercises && (
          <select
            value={selectedExerciseId}
            onChange={e => setSelectedExerciseId(e.target.value)}
            className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2"
            disabled={availableExercises.length === 0}
          >
            <option value="">
              {availableExercises.length === 0
                ? t('sections.noExercisesAvailable', 'No exercises available')
                : t('sections.selectExercise', 'Select exercise...')}
            </option>
            {availableExercises.map(ex => (
              <option key={ex.value} value={ex.value}>
                {ex.label}
              </option>
            ))}
          </select>
        )}

        <Button type="button" onClick={handleAdd} disabled={!canAdd}>
          {t('common.add', 'Add')}
        </Button>
      </div>

      {/* Selected items list */}
      {selectedItems.length > 0 && (
        <ul className="space-y-2">
          {selectedItems.map((item, index) => (
            <li
              key={`${item.itemValue}-${item.exerciseId || index}`}
              className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
            >
              <span className="text-gray-700">• {getItemLabel(item)}</span>
              <Button
                type="button"
                variant="icon"
                onClick={() => onRemoveItem(item.itemValue, item.exerciseId)}
                aria-label={`Remove ${getItemLabel(item)}`}
                style={removeStyles.button}
              >
                ×
              </Button>
            </li>
          ))}
        </ul>
      )}

      {selectedItems.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          {t('sections.noItemsSelected', 'No items selected')}
        </p>
      )}
    </div>
  );
}

const removeStyles = stylex.create({
  button: {
    color: {
      default: color.textDanger,
      ':hover': color.textDangerHover,
    },
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
  },
});
