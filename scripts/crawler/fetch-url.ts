/**
 * URL Fetcher Module
 *
 * Fetches HTML content from URLs
 */

import * as https from 'https';
import * as http from 'http';

/**
 * Fetch HTML content from URL
 */
export async function fetchUrlContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol
      .get(url, response => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            fetchUrlContent(redirectUrl).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch URL: HTTP ${response.statusCode}`));
          return;
        }

        let htmlContent = '';
        response.setEncoding('utf-8');

        response.on('data', chunk => {
          htmlContent += chunk;
        });

        response.on('end', () => {
          resolve(htmlContent);
        });

        response.on('error', reject);
      })
      .on('error', reject);
  });
}
