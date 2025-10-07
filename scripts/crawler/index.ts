/**
 * Junnufriba HTML Crawler
 *
 * Parses HTML content from multiple sources and converts to database-ready format.
 *
 * Supports three input methods:
 * 1. HTML file path
 * 2. URL to a webpage
 * 3. .txt file containing a list of paths/URLs
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { parseHtmlFile, parseHtmlContent } from './parse-html';
import { getSourcesToProcess, type InputSource } from './input-source';
import { fetchUrlContent } from './fetch-url';

type ExerciseData = {
  header: string;
  body: string;
  exerciseTypeId: string;
};

type ParsedContent = {
  header: string;
  body: string;
  images: Array<{
    originalUrl: string;
    localPath: string;
  }>;
};

/**
 * Create timestamped output directory
 */
function createOutputDirectory(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  const outputDir = path.join(
    process.cwd(),
    'docs',
    'junnufriba-crawler',
    'parsed-data',
    `${timestamp}Z`
  );

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}\n`);

  return outputDir;
}

/**
 * Download image from URL to local file
 */
async function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol
      .get(url, response => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            downloadImage(redirectUrl, outputPath).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', err => {
          fs.unlink(outputPath, () => {});
          reject(err);
        });
      })
      .on('error', reject);
  });
}

/**
 * Download images for a parsed result
 */
async function downloadImages(
  images: Array<{ originalUrl: string; localPath: string }>,
  outputDir: string,
  sourceName: string
): Promise<void> {
  if (images.length === 0) return;

  console.log(`  Downloading ${images.length} images for "${sourceName}"...`);

  for (const [index, image] of images.entries()) {
    try {
      const outputPath = path.join(outputDir, image.localPath);
      await downloadImage(image.originalUrl, outputPath);
      console.log(`    [${index + 1}/${images.length}] ✓ ${image.localPath}`);
    } catch (error) {
      console.error(`    [${index + 1}/${images.length}] ✗ Failed: ${image.originalUrl}`);
    }
  }
}

/**
 * Process a single HTML source
 */
async function processSource(source: InputSource, outputDir: string): Promise<ExerciseData> {
  let parsed: ParsedContent;

  console.log(`\nProcessing: ${source.value}`);
  console.log(`  Type: ${source.type}`);

  if (source.type === 'html-file') {
    const absolutePath = path.isAbsolute(source.value)
      ? source.value
      : path.join(process.cwd(), source.value);
    parsed = parseHtmlFile(absolutePath);
  } else if (source.type === 'url') {
    console.log('  Fetching URL...');
    const html = await fetchUrlContent(source.value);
    parsed = parseHtmlContent(html);
  } else {
    throw new Error(`Unsupported source type: ${source.type}`);
  }

  console.log(`  ✓ Title: "${parsed.header}"`);
  console.log(`  ✓ Content: ${parsed.body.length} characters`);
  console.log(`  ✓ Images: ${parsed.images.length}`);

  // Download images
  await downloadImages(parsed.images, outputDir, parsed.header);

  return {
    header: parsed.header,
    body: parsed.body,
    exerciseTypeId: '',
  };
}

/**
 * Save exercise data to JSON file
 */
function saveJsonData(exercises: ExerciseData[], outputDir: string): void {
  const jsonPath = path.join(outputDir, 'content.json');
  fs.writeFileSync(jsonPath, JSON.stringify(exercises, null, 2), 'utf-8');
  console.log(`\n✓ Saved JSON data to: ${jsonPath}`);
}

/**
 * Save markdown preview files
 */
function saveMarkdownPreviews(exercises: ExerciseData[], outputDir: string): void {
  exercises.forEach((exercise, index) => {
    const filename = exercises.length > 1 ? `content-${index + 1}.md` : 'content.md';
    const markdownPath = path.join(outputDir, filename);
    const content = `# ${exercise.header}\n\n${exercise.body}`;
    fs.writeFileSync(markdownPath, content, 'utf-8');
  });

  const previewFile = exercises.length > 1 ? `${exercises.length} preview files` : 'content.md';
  console.log(`✓ Saved markdown preview: ${previewFile}`);
}

/**
 * Main crawler function
 */
async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.error('Usage: npx tsx scripts/crawler/index.ts <source>');
      console.error('\nSource can be:');
      console.error('  - Path to HTML file: docs/file.html');
      console.error('  - URL: https://example.com/page');
      console.error('  - List file (.txt): sources.txt');
      console.error('\nExample list file format (sources.txt):');
      console.error('  docs/file1.html');
      console.error('  https://example.com/page');
      console.error('  docs/file2.html');
      process.exit(1);
    }

    const input = args[0];

    console.log('='.repeat(60));
    console.log('Junnufriba HTML Crawler');
    console.log('='.repeat(60));

    // Detect source type and get all sources to process
    const sources = getSourcesToProcess(input);
    console.log(`\nFound ${sources.length} source(s) to process`);

    // Create single output directory for all sources
    const outputDir = createOutputDirectory();

    // Process all sources
    const exercises: ExerciseData[] = [];
    for (const source of sources) {
      const exercise = await processSource(source, outputDir);
      exercises.push(exercise);
    }

    // Save all data
    saveJsonData(exercises, outputDir);
    saveMarkdownPreviews(exercises, outputDir);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✓ Crawling completed successfully!');
    console.log('='.repeat(60));
    console.log(`\nOutput directory: ${outputDir}`);
    console.log(`\nProcessed ${exercises.length} exercise(s)`);
    console.log('\nFiles created:');
    console.log(`  - content.json (array of ${exercises.length} exercise(s))`);
    if (exercises.length > 1) {
      console.log(`  - content-1.md to content-${exercises.length}.md (previews)`);
    } else {
      console.log(`  - content.md (preview)`);
    }

    const totalImages = exercises.reduce(sum => {
      // Count images in output directory
      const files = fs.readdirSync(outputDir);
      return sum + files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).length;
    }, 0);

    if (totalImages > 0) {
      console.log(`  - ${totalImages} image file(s)`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
