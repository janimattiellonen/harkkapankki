import { z } from 'zod';

const PARTICIPANT_COUNT_MIN = 0;
const PARTICIPANT_COUNT_MAX = 100;

const isParticipantCount = (val: string) => {
  const num = Number(val);
  return Number.isInteger(num) && num >= PARTICIPANT_COUNT_MIN && num <= PARTICIPANT_COUNT_MAX;
};

const optionalText = z
  .string()
  .optional()
  .transform(val => {
    if (!val) {
      return undefined;
    }
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  });

// Used by client-side react-hook-form. All fields are strings; no transforms.
export const retrospectiveFormSchema = z.object({
  participantCount: z.string().min(1, 'Participant count is required').refine(isParticipantCount, {
    message: 'Participant count must be a whole number between 0 and 100',
  }),

  summary: z
    .string()
    .min(1, 'Summary is required')
    .refine(val => val.trim().length > 0, { message: 'Summary is required' }),

  wentWell: z.string().optional(),

  improvements: z.string().optional(),
});

// Used server-side: parses + transforms to typed values.
export const retrospectiveSchema = z.object({
  participantCount: z
    .string()
    .min(1, 'Participant count is required')
    .refine(isParticipantCount, {
      message: 'Participant count must be a whole number between 0 and 100',
    })
    .transform(val => Number(val)),

  summary: z
    .string()
    .min(1, 'Summary is required')
    .transform(val => val.trim())
    .refine(val => val.length > 0, { message: 'Summary is required' }),

  wentWell: optionalText,

  improvements: optionalText,
});

export type RetrospectiveFormInput = z.infer<typeof retrospectiveFormSchema>;
export type RetrospectiveFormData = z.infer<typeof retrospectiveSchema>;
