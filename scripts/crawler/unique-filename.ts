import * as path from 'path';

/**
 * Append a numeric suffix to `filename` (before the extension) until `exists`
 * returns false. Suffix counter starts at 2 to match the slug-collision style
 * used elsewhere in this project.
 */
export function resolveUniqueFilename(
  filename: string,
  exists: (candidate: string) => boolean
): string {
  const ext = path.extname(filename);
  const base = ext ? filename.slice(0, -ext.length) : filename;

  let candidate = filename;
  let counter = 1;

  while (exists(candidate)) {
    counter++;
    candidate = `${base}-${counter}${ext}`;
  }

  return candidate;
}
