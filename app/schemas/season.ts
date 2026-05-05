import { z } from 'zod';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalString = z
  .string()
  .optional()
  .transform(val => (val && val.trim() !== '' ? val.trim() : undefined));

const optionalDateString = z
  .string()
  .optional()
  .transform(val => (val && val.trim() !== '' ? val.trim() : undefined))
  .refine(val => val === undefined || !Number.isNaN(Date.parse(val)), {
    message: 'Invalid date',
  });

export const seasonSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name cannot be longer than 255 characters'),

    description: z
      .string()
      .max(2048, 'Description cannot be longer than 2048 characters')
      .optional()
      .transform(val => (val && val.trim() !== '' ? val : undefined)),

    startDate: optionalDateString,

    endDate: optionalDateString,

    defaultDayOfWeek: optionalString
      .pipe(
        z
          .string()
          .optional()
          .refine(
            val => {
              if (val === undefined) {
                return true;
              }
              const num = Number(val);
              return Number.isInteger(num) && num >= 1 && num <= 7;
            },
            { message: 'Default day of week must be between 1 (Mon) and 7 (Sun)' }
          )
      )
      .transform(val => (val === undefined ? undefined : Number(val))),

    defaultStartTime: optionalString.pipe(
      z
        .string()
        .optional()
        .refine(val => val === undefined || TIME_PATTERN.test(val), {
          message: 'Default start time must be in HH:MM format',
        })
    ),

    defaultDurationMin: optionalString
      .pipe(
        z
          .string()
          .optional()
          .refine(val => val === undefined || val === '60' || val === '90', {
            message: 'Default duration must be 60 or 90',
          })
      )
      .transform(val => (val === undefined ? undefined : (Number(val) as 60 | 90))),
  })
  .refine(
    data => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      return data.endDate >= data.startDate;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

export type SeasonFormInput = z.input<typeof seasonSchema>;
export type SeasonFormData = z.infer<typeof seasonSchema>;
