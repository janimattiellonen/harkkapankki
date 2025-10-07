import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { parseHtmlFile } from './parse-html';

/**
 * Create timestamped output directory
 */
function createOutputDirectory(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  const outputDir = path.join(process.cwd(), 'docs', 'junnufriba-crawler', 'parsed-data', timestamp);

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);

  return outputDir;
}

/**
 * Download image from URL to local file
 */
async function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
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

      fileStream.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Download all images
 */
async function downloadImages(
  images: Array<{ originalUrl: string; localPath: string }>,
  outputDir: string
): Promise<void> {
  console.log(`\nDownloading ${images.length} images...`);

  for (const [index, image] of images.entries()) {
    try {
      const outputPath = path.join(outputDir, image.localPath);
      console.log(`  [${index + 1}/${images.length}] Downloading: ${image.originalUrl}`);
      await downloadImage(image.originalUrl, outputPath);
      console.log(`  ✓ Saved to: ${image.localPath}`);
    } catch (error) {
      console.error(`  ✗ Failed to download ${image.originalUrl}:`, error);
    }
  }
}

/**
 * Save JSON data to file
 */
function saveJsonData(data: { header: string; body: string }, outputDir: string): void {
  const jsonPath = path.join(outputDir, 'content.json');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\nSaved JSON data to: ${jsonPath}`);
}

/**
 * Main crawler function
 */
async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.error('Usage: npx tsx scripts/crawler/index.ts <html-file-path>');
      console.error('Example: npx tsx scripts/crawler/index.ts docs/junnufriba-crawler/rystyheitto.html');
      process.exit(1);
    }

    const htmlFilePath = args[0];
    const absolutePath = path.isAbsolute(htmlFilePath)
      ? htmlFilePath
      : path.join(process.cwd(), htmlFilePath);

    console.log('='.repeat(60));
    console.log('Junnufriba HTML Crawler');
    console.log('='.repeat(60));
    console.log(`\nProcessing: ${absolutePath}`);

    // Create output directory
    const outputDir = createOutputDirectory();

    // Parse HTML file
    console.log('\nParsing HTML file...');
    const parsed = parseHtmlFile(absolutePath);

    console.log(`\n✓ Page title: "${parsed.header}"`);
    console.log(`✓ Content length: ${parsed.body.length} characters`);
    console.log(`✓ Found ${parsed.images.length} images`);

    // Download images
    if (parsed.images.length > 0) {
      await downloadImages(parsed.images, outputDir);
    }

    // Prepare final JSON structure
    const jsonData = {
      header: parsed.header,
      body: parsed.body,
    };

    // Save JSON data
    saveJsonData(jsonData, outputDir);

    // Also save markdown for easy inspection
    const markdownPath = path.join(outputDir, 'content.md');
    fs.writeFileSync(markdownPath, `# ${parsed.header}\n\n${parsed.body}`, 'utf-8');
    console.log(`Saved markdown preview to: ${markdownPath}`);

    console.log('\n' + '='.repeat(60));
    console.log('✓ Parsing completed successfully!');
    console.log('='.repeat(60));
    console.log(`\nOutput directory: ${outputDir}`);
    console.log('\nFiles created:');
    console.log(`  - content.json (structured data for database import)`);
    console.log(`  - content.md (markdown preview)`);
    if (parsed.images.length > 0) {
      console.log(`  - ${parsed.images.length} image file(s)`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
