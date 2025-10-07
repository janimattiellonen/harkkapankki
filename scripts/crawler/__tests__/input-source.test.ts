import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { detectSourceType, readListFile, getSourcesToProcess } from '../input-source';

describe('Input Source Detection', () => {
  describe('detectSourceType', () => {
    it('should detect URL with https', () => {
      const result = detectSourceType('https://example.com/page.html');
      expect(result).toBe('url');
    });

    it('should detect URL with http', () => {
      const result = detectSourceType('http://example.com/page.html');
      expect(result).toBe('url');
    });

    it('should detect .txt list file', () => {
      const result = detectSourceType('sources.txt');
      expect(result).toBe('list-file');
    });

    it('should detect .txt list file with path', () => {
      const result = detectSourceType('docs/crawler/sources.txt');
      expect(result).toBe('list-file');
    });

    it('should detect HTML file as default', () => {
      const result = detectSourceType('page.html');
      expect(result).toBe('html-file');
    });

    it('should detect HTML file with path', () => {
      const result = detectSourceType('docs/crawler/page.html');
      expect(result).toBe('html-file');
    });

    it('should detect file without extension as html-file', () => {
      const result = detectSourceType('docs/myfile');
      expect(result).toBe('html-file');
    });
  });

  describe('readListFile', () => {
    const testDir = path.join(process.cwd(), 'test-temp');
    const testFile = path.join(testDir, 'test-sources.txt');

    beforeEach(() => {
      // Create temp directory for tests
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
    });

    afterEach(() => {
      // Clean up temp files
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir);
      }
    });

    it('should read list file with multiple sources', () => {
      const content = `docs/file1.html
https://example.com/page
docs/file2.html`;
      fs.writeFileSync(testFile, content);

      const result = readListFile(testFile);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('docs/file1.html');
      expect(result[1]).toBe('https://example.com/page');
      expect(result[2]).toBe('docs/file2.html');
    });

    it('should ignore comments starting with #', () => {
      const content = `docs/file1.html
# This is a comment
https://example.com/page
# Another comment
docs/file2.html`;
      fs.writeFileSync(testFile, content);

      const result = readListFile(testFile);

      expect(result).toHaveLength(3);
      expect(result).not.toContain('# This is a comment');
      expect(result).not.toContain('# Another comment');
    });

    it('should ignore empty lines', () => {
      const content = `docs/file1.html

https://example.com/page

docs/file2.html`;
      fs.writeFileSync(testFile, content);

      const result = readListFile(testFile);

      expect(result).toHaveLength(3);
    });

    it('should trim whitespace from lines', () => {
      const content = `  docs/file1.html
  https://example.com/page  `;
      fs.writeFileSync(testFile, content);

      const result = readListFile(testFile);

      expect(result[0]).toBe('docs/file1.html');
      expect(result[1]).toBe('https://example.com/page');
    });

    it('should handle mixed comments, empty lines, and whitespace', () => {
      const content = `# Header comment
docs/file1.html

  https://example.com/page
# Middle comment

docs/file2.html  `;
      fs.writeFileSync(testFile, content);

      const result = readListFile(testFile);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('docs/file1.html');
      expect(result[1]).toBe('https://example.com/page');
      expect(result[2]).toBe('docs/file2.html');
    });

    it('should throw error if file does not exist', () => {
      expect(() => readListFile('nonexistent.txt')).toThrow('List file not found');
    });

    it('should throw error if file is empty', () => {
      fs.writeFileSync(testFile, '');

      expect(() => readListFile(testFile)).toThrow('List file is empty');
    });

    it('should throw error if file contains only comments and empty lines', () => {
      const content = `# Comment one
# Comment two

`;
      fs.writeFileSync(testFile, content);

      expect(() => readListFile(testFile)).toThrow('no valid entries');
    });
  });

  describe('getSourcesToProcess', () => {
    const testDir = path.join(process.cwd(), 'test-temp');
    const testFile = path.join(testDir, 'test-sources.txt');

    beforeEach(() => {
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
    });

    afterEach(() => {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir);
      }
    });

    it('should return single HTML file source', () => {
      const result = getSourcesToProcess('docs/page.html');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('html-file');
      expect(result[0].value).toBe('docs/page.html');
    });

    it('should return single URL source', () => {
      const result = getSourcesToProcess('https://example.com/page');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('url');
      expect(result[0].value).toBe('https://example.com/page');
    });

    it('should return multiple sources from list file', () => {
      const content = `docs/file1.html
https://example.com/page
docs/file2.html`;
      fs.writeFileSync(testFile, content);

      const result = getSourcesToProcess(testFile);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ type: 'html-file', value: 'docs/file1.html' });
      expect(result[1]).toEqual({ type: 'url', value: 'https://example.com/page' });
      expect(result[2]).toEqual({ type: 'html-file', value: 'docs/file2.html' });
    });

    it('should detect correct types in mixed list', () => {
      const content = `https://example.com/page1
docs/local.html
http://another.com/page2
list-of-links.txt
https://third.com`;
      fs.writeFileSync(testFile, content);

      const result = getSourcesToProcess(testFile);

      expect(result).toHaveLength(5);
      expect(result[0].type).toBe('url');
      expect(result[1].type).toBe('html-file');
      expect(result[2].type).toBe('url');
      expect(result[3].type).toBe('list-file');
      expect(result[4].type).toBe('url');
    });

    it('should handle list file with comments', () => {
      const content = `# List of sources
docs/file1.html
# https://commented-out.com
https://example.com/page`;
      fs.writeFileSync(testFile, content);

      const result = getSourcesToProcess(testFile);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe('docs/file1.html');
      expect(result[1].value).toBe('https://example.com/page');
    });
  });
});
