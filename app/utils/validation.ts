import { z } from "zod";

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function parseData<T extends z.ZodType>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    // Convert Zod errors to a field-error map
    const errors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      const path = error.path.join(".");
      errors[path] = error.message;
    });
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}