export type ExerciseTypeOption = {
  id: string;
  name: string;
  slug: string;
  children?: ExerciseTypeOption[];
};