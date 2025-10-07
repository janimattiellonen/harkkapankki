import { describe, it, expect } from 'vitest';
import { extractTitle, extractAndConvertContent } from '../parse-html';

describe('HTML Parser', () => {
  describe('extractTitle', () => {
    it('should extract title from entry-header', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <div class="entry-header-inner">
                <h1 class="entry-title">Rystyheitto</h1>
              </div>
            </header>
          </body>
        </html>
      `;

      const title = extractTitle(html);
      expect(title).toBe('Rystyheitto');
    });

    it('should trim whitespace from title', () => {
      const html = `
        <header class="entry-header">
          <h1 class="entry-title">  Test Title  </h1>
        </header>
      `;

      const title = extractTitle(html);
      expect(title).toBe('Test Title');
    });

    it('should throw error if title not found', () => {
      const html = '<html><body></body></html>';

      expect(() => extractTitle(html)).toThrow('Could not find page title');
    });
  });

  describe('extractAndConvertContent', () => {
    it('should extract basic paragraph content', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <p>This is a test paragraph.</p>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.header).toBe('Test');
      expect(result.body).toContain('This is a test paragraph');
    });

    it('should throw error if entry-content not found', () => {
      const html = `
        <html>
          <header class="entry-header">
            <h1 class="entry-title">Test</h1>
          </header>
          <body></body>
        </html>
      `;

      expect(() => extractAndConvertContent(html)).toThrow('Could not find .entry-content');
    });
  });

  describe('YouTube embed conversion', () => {
    it('should convert YouTube iframe to @[youtube] tag', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <p>Introduction text</p>
              <figure class="wp-block-embed">
                <iframe src="https://www.youtube.com/embed/V9vp_5fyZsI?feature=oembed" frameborder="0"></iframe>
              </figure>
              <p>More text</p>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toContain('@[youtube](https://youtu.be/V9vp_5fyZsI)');
      expect(result.body).toContain('Introduction text');
      expect(result.body).toContain('More text');
    });

    it('should handle multiple YouTube videos', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <iframe src="https://www.youtube.com/embed/abc123"></iframe>
              <iframe src="https://www.youtube.com/embed/xyz789"></iframe>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toContain('@[youtube](https://youtu.be/abc123)');
      expect(result.body).toContain('@[youtube](https://youtu.be/xyz789)');
    });

    it('should handle video IDs with underscores', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <iframe src="https://www.youtube.com/embed/test_video_123"></iframe>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toContain('@[youtube](https://youtu.be/test_video_123)');
    });
  });

  describe('Bullet list conversion', () => {
    it('should convert bullet points with • to markdown lists', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <p>Introduction text:<br>• First item<br>• Second item<br>• Third item</p>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toMatch(/Introduction text/);
      expect(result.body).toMatch(/\*\s+First item/);
      expect(result.body).toMatch(/\*\s+Second item/);
      expect(result.body).toMatch(/\*\s+Third item/);
    });

    it('should handle text before and after bullet lists', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <p>Text before:<br>• Item one<br>• Item two</p>
              <p>Text after</p>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toContain('Text before');
      expect(result.body).toMatch(/\*\s+Item one/);
      expect(result.body).toMatch(/\*\s+Item two/);
      expect(result.body).toContain('Text after');
    });

    it('should handle existing proper HTML lists', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <ul>
                <li>First item</li>
                <li>Second item</li>
              </ul>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toMatch(/\*\s+First item/);
      expect(result.body).toMatch(/\*\s+Second item/);
    });
  });

  describe('Heading conversion', () => {
    it('should convert h2 to ## markdown', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <h2>Main Section</h2>
              <p>Content here</p>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toMatch(/##\s+Main Section/);
    });

    it('should convert h3 to ## markdown', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <h3>Subsection</h3>
              <p>Content here</p>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toMatch(/##\s+Subsection/);
    });

    it('should handle multiple headings', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <h2>First</h2>
              <p>Text</p>
              <h3>Second</h3>
              <p>More text</p>
              <h2>Third</h2>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.body).toMatch(/##\s+First/);
      expect(result.body).toMatch(/##\s+Second/);
      expect(result.body).toMatch(/##\s+Third/);
    });
  });

  describe('Image handling', () => {
    it('should convert images to markdown and track them', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <p>Text before</p>
              <img src="https://example.com/image.jpg" alt="Test Image">
              <p>Text after</p>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      // Turndown escapes square brackets
      expect(result.body).toContain('!\\[Test Image\\](/public/uploads/image-1.jpg)');
      expect(result.images).toHaveLength(1);
      expect(result.images[0].originalUrl).toBe('https://example.com/image.jpg');
      expect(result.images[0].localPath).toBe('image-1.jpg');
    });

    it('should handle multiple images', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <img src="https://example.com/img1.png" alt="First">
              <img src="https://example.com/img2.gif" alt="Second">
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.images).toHaveLength(2);
      expect(result.images[0].localPath).toBe('image-1.png');
      expect(result.images[1].localPath).toBe('image-2.gif');
    });

    it('should use default extension if none provided', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <img src="https://example.com/noextension" alt="Test">
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      expect(result.images[0].localPath).toBe('image-1.jpg');
    });
  });

  describe('Complex content scenarios', () => {
    it('should handle mixed content with all features', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Complete Test</h1>
            </header>
            <div class="entry-content">
              <p>Introduction paragraph.</p>

              <iframe src="https://www.youtube.com/embed/test123"></iframe>

              <h2>Section One</h2>
              <p>Some text with bullets:<br>• Point one<br>• Point two</p>

              <img src="https://example.com/test.jpg" alt="Test">

              <h3>Subsection</h3>
              <ul>
                <li>Proper list item</li>
              </ul>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      // Check all features are present
      expect(result.header).toBe('Complete Test');
      expect(result.body).toContain('Introduction paragraph');
      expect(result.body).toContain('@[youtube](https://youtu.be/test123)');
      expect(result.body).toMatch(/##\s+Section One/);
      expect(result.body).toMatch(/\*\s+Point one/);
      // Turndown escapes square brackets
      expect(result.body).toContain('!\\[Test\\](/public/uploads/image-1.jpg)');
      expect(result.body).toMatch(/##\s+Subsection/);
      expect(result.images).toHaveLength(1);
    });

    it('should clean up excessive newlines', () => {
      const html = `
        <html>
          <body>
            <header class="entry-header">
              <h1 class="entry-title">Test</h1>
            </header>
            <div class="entry-content">
              <p>First paragraph</p>



              <p>Second paragraph</p>
            </div>
          </body>
        </html>
      `;

      const result = extractAndConvertContent(html);

      // Should not have more than 2 consecutive newlines
      expect(result.body).not.toMatch(/\n{3,}/);
    });
  });
});
