import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import TurndownService from 'turndown';
import * as fs from 'fs';
import * as path from 'path';

type ParsedContent = {
  header: string;
  body: string;
  images: Array<{
    originalUrl: string;
    localPath: string;
  }>;
};

/**
 * Extract page title from HTML
 */
export function extractTitle(html: string): string {
  const $ = cheerio.load(html);
  const title = $('.entry-header h1.entry-title').first().text().trim();

  if (!title) {
    throw new Error('Could not find page title in HTML');
  }

  return title;
}

/**
 * Extract YouTube video ID from iframe src
 */
function extractYouTubeId(src: string): string | null {
  const match = src.match(/youtube\.com\/embed\/([^?]+)/);
  return match ? match[1] : null;
}

/**
 * Convert YouTube iframe to markdown youtube tag
 * Using a special marker that we'll replace after turndown conversion
 */
function convertYouTubeEmbed(iframe: cheerio.Cheerio<AnyNode>): string {
  const src = iframe.attr('src');
  if (!src) return '';

  const videoId = extractYouTubeId(src);
  if (!videoId) return '';

  // Use a simple text marker that will survive turndown
  return `<p>YOUTUBEVIDEO::${videoId}</p>`;
}

/**
 * Extract content and convert to markdown
 */
export function extractAndConvertContent(html: string): ParsedContent {
  const $ = cheerio.load(html);
  const contentElement = $('.entry-content').first();

  if (contentElement.length === 0) {
    throw new Error('Could not find .entry-content in HTML');
  }

  const images: Array<{ originalUrl: string; localPath: string }> = [];

  // Process YouTube iframes before converting
  contentElement.find('iframe').each((_, elem) => {
    const iframe = $(elem);
    const src = iframe.attr('src');

    if (src && src.includes('youtube.com')) {
      const youtubeMarkdown = convertYouTubeEmbed(iframe);
      // Replace the entire figure wrapper or just the iframe
      const figure = iframe.closest('figure');
      if (figure.length > 0) {
        figure.replaceWith(youtubeMarkdown);
      } else {
        iframe.replaceWith(youtubeMarkdown);
      }
    }
  });

  // Process images
  contentElement.find('img').each((index, elem) => {
    const img = $(elem);
    const src = img.attr('src');

    if (src) {
      const filename = `image-${index + 1}${path.extname(src) || '.jpg'}`;
      const localPath = `/public/uploads/${filename}`;

      images.push({
        originalUrl: src,
        localPath: filename, // Store just the filename for downloading
      });

      // Replace img with markdown using the new path
      const alt = img.attr('alt') || '';
      img.replaceWith(`![${alt}](${localPath})`);
    }
  });

  // Convert bullet lists made with • to proper lists
  contentElement.find('p').each((_, elem) => {
    const p = $(elem);
    const html = p.html();

    if (html && html.includes('•')) {
      // Split by <br> and process each line
      const lines = html.split(/<br\s*\/?>/i).map(line => line.trim()).filter(line => line);
      const parts: Array<{ type: 'text' | 'list'; content: string[] }> = [];
      let currentList: string[] = [];
      let currentText: string[] = [];

      for (const line of lines) {
        if (line.startsWith('•')) {
          // If we have accumulated text, save it
          if (currentText.length > 0) {
            parts.push({ type: 'text', content: currentText });
            currentText = [];
          }
          // Add to list
          const cleanLine = line.replace(/^•\s*/, '').trim();
          if (cleanLine) {
            currentList.push(cleanLine);
          }
        } else if (line) {
          // If we have accumulated list items, save them
          if (currentList.length > 0) {
            parts.push({ type: 'list', content: currentList });
            currentList = [];
          }
          // Add to text
          currentText.push(line);
        }
      }

      // Save any remaining content
      if (currentText.length > 0) {
        parts.push({ type: 'text', content: currentText });
      }
      if (currentList.length > 0) {
        parts.push({ type: 'list', content: currentList });
      }

      // Build replacement HTML
      if (parts.length > 0) {
        const replacement = parts.map(part => {
          if (part.type === 'text') {
            return '<p>' + part.content.join(' ') + '</p>';
          } else {
            return '<ul>' + part.content.map(item => `<li>${item}</li>`).join('') + '</ul>';
          }
        }).join('');

        p.replaceWith(replacement);
      }
    }
  });

  // Initialize Turndown with custom rules
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  // Add custom rule for h3 to become ## (heading level 2)
  turndownService.addRule('h3ToH2', {
    filter: ['h3'],
    replacement: (content: string) => {
      return `\n\n## ${content}\n\n`;
    },
  });

  // Add custom rule for h2 to stay as ##
  turndownService.addRule('h2', {
    filter: ['h2'],
    replacement: (content: string) => {
      return `\n\n## ${content}\n\n`;
    },
  });

  // Convert HTML to markdown
  const contentHtml = contentElement.html() || '';
  let markdown = turndownService.turndown(contentHtml);

  // Replace YouTube markers with proper syntax (handle escaped underscores)
  markdown = markdown.replace(/YOUTUBEVIDEO::([a-zA-Z0-9\\_-]+)/g, (_: string, videoId: string) => {
    // Remove escape backslashes from underscores
    const cleanVideoId = videoId.replace(/\\_/g, '_');
    return `@[youtube](https://youtu.be/${cleanVideoId})`;
  });

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  return {
    header: extractTitle(html),
    body: markdown,
    images,
  };
}

/**
 * Parse HTML file and extract structured data
 */
export function parseHtmlFile(filePath: string): ParsedContent {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  return extractAndConvertContent(html);
}
