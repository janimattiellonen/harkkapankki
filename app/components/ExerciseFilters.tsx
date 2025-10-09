import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExerciseTypeOption } from '~/types';

type ExerciseFiltersProps = {
  exerciseTypes: ExerciseTypeOption[];
  searchTerm: string;
  selectedTypeIds: string[];
  onSearchChange: (term: string) => void;
  onTypeToggle: (typeId: string, isParent: boolean) => void;
  onClearFilters: () => void;
  isParentSelected: (parentId: string) => boolean;
  isParentIndeterminate: (parentId: string) => boolean;
  hasActiveFilters: boolean;
};

export function ExerciseFilters({
  exerciseTypes,
  searchTerm,
  selectedTypeIds,
  onSearchChange,
  onTypeToggle,
  onClearFilters,
  isParentSelected,
  isParentIndeterminate,
  hasActiveFilters,
}: ExerciseFiltersProps) {
  const { t } = useTranslation();
  const showSearchWarning = searchTerm.length > 0 && searchTerm.length < 3;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wasFocusedRef = useRef(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Track if input was focused before re-render
  useEffect(() => {
    const handleFocusIn = () => {
      wasFocusedRef.current = document.activeElement === searchInputRef.current;
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  // Restore focus after navigation if it was previously focused
  useEffect(() => {
    if (wasFocusedRef.current && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('exercises.filterTitle')}</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {t('exercises.clearFilters')}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            {t('exercises.searchByTitle')}
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              id="search"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={() => {
                wasFocusedRef.current = true;
              }}
              onBlur={() => {
                wasFocusedRef.current = false;
              }}
              placeholder={t('exercises.searchPlaceholder')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {showSearchWarning && (
            <p className="mt-1 text-sm text-amber-600">{t('exercises.searchWarning')}</p>
          )}
        </div>

        {/* Toggle Advanced Filters */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAdvancedFilters ? t('exercises.lessFilters') : t('exercises.moreFilters')}
        </button>

        {/* Exercise Type Checkboxes */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showAdvancedFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="block text-sm font-medium text-gray-700 mb-2">
            {t('exercises.exerciseTypes')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {exerciseTypes.map(type => (
              <div key={type.id}>
                {/* Parent Checkbox */}
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={isParentSelected(type.id)}
                    ref={input => {
                      if (input) {
                        input.indeterminate = isParentIndeterminate(type.id);
                      }
                    }}
                    onChange={() => onTypeToggle(type.id, true)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">{type.name}</span>
                </label>

                {/* Child Checkboxes */}
                {type.children && type.children.length > 0 && (
                  <div className="ml-6 space-y-2 mt-1">
                    {type.children.map(child => (
                      <label
                        key={child.id}
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTypeIds.includes(child.id)}
                          onChange={() => onTypeToggle(child.id, false)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">↳ {child.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
