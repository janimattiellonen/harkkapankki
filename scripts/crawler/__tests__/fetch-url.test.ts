import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as http from 'http';
import * as https from 'https';
import { fetchUrlContent } from '../fetch-url';

// Mock the http and https modules
vi.mock('http');
vi.mock('https');

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('URL Fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchUrlContent', () => {
    it('should fetch content from HTTPS URL', async () => {
      const mockHtml = '<html><body>Test Content</body></html>';

      // Mock https.get
      const mockGet = vi.fn((url, callback) => {
        const mockResponse = {
          statusCode: 200,
          setEncoding: vi.fn(),
          on: vi.fn((event, handler) => {
            if (event === 'data') {
              handler(mockHtml);
            }
            if (event === 'end') {
              handler();
            }
            return mockResponse;
          }),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
        };
      });

      vi.mocked(https).get = mockGet as any;

      const result = await fetchUrlContent('https://example.com/page.html');

      expect(result).toBe(mockHtml);
      expect(mockGet).toHaveBeenCalledWith('https://example.com/page.html', expect.any(Function));
    });

    it('should fetch content from HTTP URL', async () => {
      const mockHtml = '<html><body>HTTP Content</body></html>';

      const mockGet = vi.fn((url, callback) => {
        const mockResponse = {
          statusCode: 200,
          setEncoding: vi.fn(),
          on: vi.fn((event, handler) => {
            if (event === 'data') {
              handler(mockHtml);
            }
            if (event === 'end') {
              handler();
            }
            return mockResponse;
          }),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
        };
      });

      vi.mocked(http).get = mockGet as any;

      const result = await fetchUrlContent('http://example.com/page.html');

      expect(result).toBe(mockHtml);
      expect(mockGet).toHaveBeenCalledWith('http://example.com/page.html', expect.any(Function));
    });

    it('should handle multiple data chunks', async () => {
      const chunk1 = '<html><body>';
      const chunk2 = 'Content';
      const chunk3 = '</body></html>';

      const mockGet = vi.fn((url, callback) => {
        const mockResponse = {
          statusCode: 200,
          setEncoding: vi.fn(),
          on: vi.fn((event, handler) => {
            if (event === 'data') {
              handler(chunk1);
              handler(chunk2);
              handler(chunk3);
            }
            if (event === 'end') {
              handler();
            }
            return mockResponse;
          }),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
        };
      });

      vi.mocked(https).get = mockGet as any;

      const result = await fetchUrlContent('https://example.com/page.html');

      expect(result).toBe(chunk1 + chunk2 + chunk3);
    });

    it('should follow redirects (301)', async () => {
      const mockHtml = '<html><body>Redirected Content</body></html>';
      let callCount = 0;

      const mockGet = vi.fn((url, callback) => {
        callCount++;
        if (callCount === 1) {
          // First call returns redirect
          const mockResponse = {
            statusCode: 301,
            headers: {
              location: 'https://example.com/new-page.html',
            },
            setEncoding: vi.fn(),
            on: vi.fn(),
          };
          callback(mockResponse);
        } else {
          // Second call returns content
          const mockResponse = {
            statusCode: 200,
            setEncoding: vi.fn(),
            on: vi.fn((event, handler) => {
              if (event === 'data') {
                handler(mockHtml);
              }
              if (event === 'end') {
                handler();
              }
              return mockResponse;
            }),
          };
          callback(mockResponse);
        }
        return {
          on: vi.fn(),
        };
      });

      vi.mocked(https).get = mockGet as any;

      const result = await fetchUrlContent('https://example.com/old-page.html');

      expect(result).toBe(mockHtml);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('should follow redirects (302)', async () => {
      const mockHtml = '<html><body>Redirected Content</body></html>';
      let callCount = 0;

      const mockGet = vi.fn((url, callback) => {
        callCount++;
        if (callCount === 1) {
          const mockResponse = {
            statusCode: 302,
            headers: {
              location: 'https://example.com/new-page.html',
            },
            setEncoding: vi.fn(),
            on: vi.fn(),
          };
          callback(mockResponse);
        } else {
          const mockResponse = {
            statusCode: 200,
            setEncoding: vi.fn(),
            on: vi.fn((event, handler) => {
              if (event === 'data') {
                handler(mockHtml);
              }
              if (event === 'end') {
                handler();
              }
              return mockResponse;
            }),
          };
          callback(mockResponse);
        }
        return {
          on: vi.fn(),
        };
      });

      vi.mocked(https).get = mockGet as any;

      const result = await fetchUrlContent('https://example.com/old-page.html');

      expect(result).toBe(mockHtml);
    });

    it('should reject on non-200 status code', async () => {
      const mockGet = vi.fn((url, callback) => {
        const mockResponse = {
          statusCode: 404,
          setEncoding: vi.fn(),
          on: vi.fn(),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
        };
      });

      vi.mocked(https).get = mockGet as any;

      await expect(fetchUrlContent('https://example.com/notfound.html')).rejects.toThrow(
        'Failed to fetch URL: HTTP 404'
      );
    });

    it('should reject on request error', async () => {
      const mockGet = vi.fn(() => {
        const mockRequest = {
          on: vi.fn((event, handler) => {
            if (event === 'error') {
              handler(new Error('Network error'));
            }
            return mockRequest;
          }),
        };
        return mockRequest;
      });

      vi.mocked(https).get = mockGet as any;

      await expect(fetchUrlContent('https://example.com/page.html')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle missing redirect location', async () => {
      const mockGet = vi.fn((url, callback) => {
        const mockResponse = {
          statusCode: 301,
          headers: {}, // No location header
          setEncoding: vi.fn(),
          on: vi.fn(),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
        };
      });

      vi.mocked(https).get = mockGet as any;

      await expect(fetchUrlContent('https://example.com/page.html')).rejects.toThrow(
        'Failed to fetch URL: HTTP 301'
      );
    });
  });
});
