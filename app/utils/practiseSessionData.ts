import type { Section } from "~/types";

export const SECTIONS: Section[] = [
  {
    id: crypto.randomUUID(),
    name: 'Introduction',
    duration: 5,
    items: [
      { value: crypto.randomUUID(), label: 'Throwing order' },
      { value: crypto.randomUUID(), label: 'OB rules' },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: 'Warm-up',
    duration: { 60: 10, 90: 20 },
    items: [
      { value: crypto.randomUUID(), label: 'Motor skill' },
      { value: crypto.randomUUID(), label: 'Muscle condition' },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: 'Technique',
    duration: { 60: 40, 90: 60 },
    items: [
      { value: crypto.randomUUID(), label: 'Putting' },
      { value: crypto.randomUUID(), label: 'Driving' },
    ],
  },
  {
    id: crypto.randomUUID(),
    name: 'Closing',
    duration: 5,
    items: [
      { value: crypto.randomUUID(), label: 'Closing' },
    ],
  },
];
