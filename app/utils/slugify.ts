/**
 * Converts a string into a URL-safe slug
 *
 * Rules:
 * - Converts to lowercase
 * - Replaces spaces and underscores with hyphens
 * - Removes special characters except a-z, 0-9, hyphens, and underscores
 * - Removes consecutive hyphens
 * - Trims hyphens from start and end
 *
 * @param text - The text to slugify
 * @returns A URL-safe slug
 *
 * @example
 * slugify("Approach Shot Warmup") // "approach-shot-warmup"
 * slugify("Putting: 10 feet!!") // "putting-10-feet"
 * slugify("Back-hand  technique") // "back-hand-technique"
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove all characters that are not a-z, 0-9, hyphen, or underscore
      .replace(/[^a-z0-9\-_]/g, '')
      // Replace multiple consecutive hyphens with a single hyphen
      .replace(/-+/g, '-')
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
}

/**
 * Generates a unique slug by appending a suffix if the base slug already exists
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of slugs that already exist
 * @returns A unique slug
 *
 * @example
 * makeUniqueSlug("test", ["test"]) // "test-2"
 * makeUniqueSlug("test", ["test", "test-2"]) // "test-3"
 */
export function makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}
