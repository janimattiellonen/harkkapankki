import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useSubmit } from "@remix-run/react";
import type { ExerciseTypeOption } from "~/types";

export type FilterState = {
  searchTerm: string;
  selectedTypeIds: string[];
};

type UseExerciseFiltersProps = {
  exerciseTypes: ExerciseTypeOption[];
};

export function useExerciseFilters({ exerciseTypes }: UseExerciseFiltersProps) {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const [isDebouncing, setIsDebouncing] = useState(false);
  const isInitialMount = useRef(true);

  // Initialize from URL params only once
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("q") || "");
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>(() =>
    searchParams.get("types")?.split(",").filter(Boolean) || []
  );

  // Sync filters to URL
  const syncToURL = useCallback((search: string, typeIds: string[]) => {
    const params = new URLSearchParams();

    if (search.length >= 3) {
      params.set("q", search);
    }

    if (typeIds.length > 0) {
      params.set("types", typeIds.join(","));
    }

    submit(params, { method: "get", replace: true, preventScrollReset: true });
  }, [submit]);

  // Debounce search term and sync to URL
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (searchTerm.length > 0 && searchTerm.length < 3) {
      // Don't trigger search for < 3 characters
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      // Only navigate after user stops typing
      syncToURL(searchTerm, selectedTypeIds);
      setIsDebouncing(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, selectedTypeIds, syncToURL]);

  // Sync selected types to URL immediately
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    syncToURL(searchTerm, selectedTypeIds);
  }, [selectedTypeIds, searchTerm, syncToURL]);

  // Get all child IDs for a parent type
  const getChildIds = (parentId: string): string[] => {
    const parent = exerciseTypes.find(t => t.id === parentId);
    return parent?.children?.map(c => c.id) || [];
  };

  // Check if a parent type is selected (all children selected)
  const isParentSelected = (parentId: string): boolean => {
    const childIds = getChildIds(parentId);
    if (childIds.length === 0) return selectedTypeIds.includes(parentId);
    return childIds.every(id => selectedTypeIds.includes(id));
  };

  // Check if parent is indeterminate (some but not all children selected)
  const isParentIndeterminate = (parentId: string): boolean => {
    const childIds = getChildIds(parentId);
    if (childIds.length === 0) return false;
    const selectedChildren = childIds.filter(id => selectedTypeIds.includes(id));
    return selectedChildren.length > 0 && selectedChildren.length < childIds.length;
  };

  const toggleExerciseType = (typeId: string, isParent: boolean) => {
    if (isParent) {
      const childIds = getChildIds(typeId);

      if (childIds.length === 0) {
        // Parent with no children - toggle normally
        setSelectedTypeIds(prev =>
          prev.includes(typeId)
            ? prev.filter(id => id !== typeId)
            : [...prev, typeId]
        );
      } else {
        // Parent with children - toggle all children
        const allSelected = isParentSelected(typeId);

        if (allSelected) {
          // Deselect all children
          setSelectedTypeIds(prev => prev.filter(id => !childIds.includes(id)));
        } else {
          // Select all children
          setSelectedTypeIds(prev => {
            const newIds = [...prev];
            childIds.forEach(id => {
              if (!newIds.includes(id)) {
                newIds.push(id);
              }
            });
            return newIds;
          });
        }
      }
    } else {
      // Child type - toggle normally
      setSelectedTypeIds(prev =>
        prev.includes(typeId)
          ? prev.filter(id => id !== typeId)
          : [...prev, typeId]
      );
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTypeIds([]);
    submit(new URLSearchParams(), { method: "get", replace: true, preventScrollReset: true });
  };

  const hasActiveFilters = searchTerm.length >= 3 || selectedTypeIds.length > 0;

  return {
    searchTerm,
    setSearchTerm,
    selectedTypeIds,
    toggleExerciseType,
    clearFilters,
    isLoading: isDebouncing,
    hasActiveFilters,
    isParentSelected,
    isParentIndeterminate,
  };
}
