import { z } from 'zod';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const rowSchema = z
  .object({
    date: z.string().regex(DATE_PATTERN, 'Invalid date'),
    startTime: z.string().regex(TIME_PATTERN, 'Invalid start time'),
    endTime: z.string().regex(TIME_PATTERN, 'Invalid end time'),
  })
  .refine(
    row => {
      const [sh, sm] = row.startTime.split(':').map(Number);
      const [eh, em] = row.endTime.split(':').map(Number);
      return eh * 60 + em - (sh * 60 + sm) >= 30;
    },
    { message: 'End time must be at least 30 minutes after start time' }
  );

export const addSessionsSchema = z.object({
  rows: z
    .string()
    .min(1, 'rows is required')
    .transform((value, ctx) => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid rows payload' });
        return z.NEVER;
      }
    })
    .pipe(
      z
        .array(rowSchema)
        .min(1, 'At least one session is required')
        .max(20, 'Maximum 20 sessions per batch')
    ),
});

export type AddSessionsRow = z.infer<typeof rowSchema>;
export type AddSessionsFormData = z.infer<typeof addSessionsSchema>;
