/**
 * Input Source Detection and Handling
 *
 * Detects the type of input source (file, URL, or list) and provides
 * utilities to process each type.
 */

import * as fs from 'fs';
import * as path from 'path';

export type SourceType = 'html-file' | 'url' | 'list-file';

export type InputSource = {
  type: SourceType;
  value: string;
};

/**
 * Detect the type of input source
 */
export function detectSourceType(input: string): SourceType {
  // Check if it's a URL
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return 'url';
  }

  // Check if it's a .txt file (list)
  if (input.endsWith('.txt')) {
    return 'list-file';
  }

  // Otherwise, assume it's an HTML file path
  return 'html-file';
}

/**
 * Read list file and return array of sources
 */
export function readListFile(filePath: string): string[] {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`List file not found: ${filePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')); // Filter empty lines and comments

  if (lines.length === 0) {
    throw new Error(`List file is empty or contains no valid entries: ${filePath}`);
  }

  return lines;
}

/**
 * Get all sources to process based on input
 */
export function getSourcesToProcess(input: string): InputSource[] {
  const type = detectSourceType(input);

  if (type === 'list-file') {
    const sources = readListFile(input);
    return sources.map(source => ({
      type: detectSourceType(source),
      value: source,
    }));
  }

  return [{ type, value: input }];
}
