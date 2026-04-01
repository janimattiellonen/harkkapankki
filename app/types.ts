export type ExerciseTypeOption = {
  id: string;
  name: string;
  slug: string;
  children?: ExerciseTypeOption[];
};

// Practice Session Types
export type PractiseLength = 60 | 90;

export type ExerciseOption = {
  value: string; // exercise ID
  label: string; // exercise name
};

export type SectionItem = {
  value: string; // UUID (exerciseTypeId)
  label: string; // Human readable
  exercises?: ExerciseOption[];
};

export type Section = {
  id: string; // UUID
  name: string; // "Introduction", "Warm-up", etc.
  items: SectionItem[];
  duration: number | Record<PractiseLength, number>; // 5 or { 60: 10, 90: 20 }
};

export type SelectedItem = {
  sectionId: string;
  itemValue: string; // exerciseTypeId
  exerciseId?: string;
  exerciseLabel?: string;
};
