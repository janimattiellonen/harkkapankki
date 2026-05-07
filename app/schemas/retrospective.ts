import { z } from 'zod';

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

export const retrospectiveSchema = z.object({
  participantCount: z
    .string()
    .min(1, 'Participant count is required')
    .refine(
      val => {
        const num = Number(val);
        return Number.isInteger(num) && num >= 0 && num <= 100;
      },
      { message: 'Participant count must be a whole number between 0 and 100' }
    )
    .transform(val => Number(val)),

  summary: z
    .string()
    .min(1, 'Summary is required')
    .transform(val => val.trim())
    .refine(val => val.length > 0, { message: 'Summary is required' }),

  wentWell: optionalText,

  improvements: optionalText,
});

export type RetrospectiveFormInput = z.input<typeof retrospectiveSchema>;
export type RetrospectiveFormData = z.infer<typeof retrospectiveSchema>;
