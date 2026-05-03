import { describe, it, expect } from 'vitest';
import { resolveUniqueFilename } from '../unique-filename';

describe('resolveUniqueFilename', () => {
  it('returns the input filename when nothing exists', () => {
    expect(resolveUniqueFilename('ctp-kisa-image-1.jpeg', () => false)).toBe(
      'ctp-kisa-image-1.jpeg'
    );
  });

  it('appends -2 when the base filename already exists', () => {
    const taken = new Set(['ctp-kisa-image-1.jpeg']);
    expect(resolveUniqueFilename('ctp-kisa-image-1.jpeg', name => taken.has(name))).toBe(
      'ctp-kisa-image-1-2.jpeg'
    );
  });

  it('keeps incrementing until a free name is found', () => {
    const taken = new Set([
      'ctp-kisa-image-1.jpeg',
      'ctp-kisa-image-1-2.jpeg',
      'ctp-kisa-image-1-3.jpeg',
    ]);
    expect(resolveUniqueFilename('ctp-kisa-image-1.jpeg', name => taken.has(name))).toBe(
      'ctp-kisa-image-1-4.jpeg'
    );
  });

  it('handles filenames without an extension', () => {
    const taken = new Set(['noextension']);
    expect(resolveUniqueFilename('noextension', name => taken.has(name))).toBe('noextension-2');
  });

  it('preserves the extension when renaming', () => {
    const taken = new Set(['photo.png']);
    expect(resolveUniqueFilename('photo.png', name => taken.has(name))).toBe('photo-2.png');
  });
});
