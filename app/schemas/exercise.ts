import { z } from "zod";

// Schema for the form input
export const exerciseFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name cannot be longer than 255 characters"),
  
  description: z.string()
    .max(1024, "Description cannot be longer than 1024 characters")
    .nullable()
    .optional(),
  
  content: z.string()
    .min(1, "Content is required")
    .max(2048, "Content cannot be longer than 2048 characters"),
  
  youtubeVideo: z.string()
    .max(255, "YouTube video URL cannot be longer than 255 characters")
    .nullable()
    .optional(),
  
  duration: z.string()
    .min(1, "Duration is required")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 255;
      },
      {
        message: "Duration must be a number between 1 and 255 minutes",
      }
    ),
});

// Schema for validated data (after transformation)
export const exerciseSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name cannot be longer than 255 characters"),
  
  description: z.string()
    .max(1024, "Description cannot be longer than 1024 characters")
    .nullable()
    .optional(),
  
  content: z.string()
    .min(1, "Content is required")
    .max(2048, "Content cannot be longer than 2048 characters"),
  
  youtubeVideo: z.string()
    .max(255, "YouTube video URL cannot be longer than 255 characters")
    .nullable()
    .optional(),
  
  duration: z.string()
    .min(1, "Duration is required")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 255;
      },
      {
        message: "Duration must be a number between 1 and 255 minutes",
      }
    )
    .transform((val) => parseInt(val, 10)),
});

export type ExerciseFormData = z.infer<typeof exerciseFormSchema>;