# Junnufriba HTML Crawler

This script parses HTML content from multiple sources and converts them to markdown format suitable for importing into the database.

## Features

- **Multiple input methods**:
  - HTML file paths
  - URLs (fetches content directly from web)
  - List files (.txt) containing multiple sources
- Extracts page titles from `<header class="entry-header">`
- Extracts and converts content from `<div class="entry-content">`
- Converts HTML to markdown:
  - `<h2>` and `<h3>` → `##` markdown headings
  - Bullet lists with `•` → proper markdown unordered lists
  - YouTube iframes → `@[youtube](URL)` tags
  - Images → markdown format with `/public/uploads/` prefix
- Downloads images to the output directory
- Saves structured JSON data for database import (supports arrays)
- Creates timestamped output directories to avoid conflicts
- Processes multiple sources in a single run

## Usage

### 1. Parse a single HTML file

```bash
npx tsx scripts/crawler/index.ts <path-to-html-file>
```

**Example:**

```bash
npx tsx scripts/crawler/index.ts docs/junnufriba-crawler/rystyheitto.html
```

### 2. Fetch content from a URL

```bash
npx tsx scripts/crawler/index.ts <url>
```

**Example:**

```bash
npx tsx scripts/crawler/index.ts https://example.com/exercises/backhand
```

### 3. Process multiple sources from a list file

Create a `.txt` file with one source per line (can mix files and URLs):

**sources.txt:**

```
docs/junnufriba-crawler/rystyheitto.html
https://example.com/exercises/backhand
docs/junnufriba-crawler/kammenheitto.html
# Comments starting with # are ignored
https://example.com/exercises/forehand
```

Then run:

```bash
npx tsx scripts/crawler/index.ts sources.txt
```

## Output

The script creates a single timestamped directory under `docs/junnufriba-crawler/parsed-data/` with:

- `content.json` - Structured data ready for database import (array format)
- `content.md` or `content-1.md`, `content-2.md`, etc. - Markdown previews for manual inspection
- Downloaded images (if any)

### JSON Structure

**Single source:**

```json
[
  {
    "header": "Page Title",
    "body": "Markdown content with @[youtube](URL) tags...",
    "exerciseTypeId": ""
  }
]
```

**Multiple sources:**

```json
[
  {
    "header": "Exercise 1",
    "body": "Content...",
    "exerciseTypeId": ""
  },
  {
    "header": "Exercise 2",
    "body": "Content...",
    "exerciseTypeId": ""
  }
]
```

## Next Steps

After parsing:

1. **Manual Review**: Check the generated markdown files
2. **Adjust if needed**: Edit the JSON file if necessary
3. **Import to Database**: Use the `insert-content.ts` script:
   ```bash
   npm run insert-exercises -- path/to/content.json <exercise-type-id>
   ```

## Notes

- The parsed data directory is in `.gitignore` to avoid committing large amounts of parsed content
- Images are saved with the path prefix `/public/uploads/` as expected by the application
- YouTube videos are converted to the app's custom `@[youtube](URL)` format
- Duplicate runs create new timestamped directories, preserving previous parses
- All sources in a list are processed into a single output directory with a single `content.json` array
- Comments in list files (lines starting with `#`) are ignored
- Empty lines in list files are ignored

## File Structure

```
scripts/crawler/
├── index.ts           # Main script with multi-source support
├── parse-html.ts      # HTML parsing and conversion logic
├── input-source.ts    # Input type detection and list file handling
├── fetch-url.ts       # URL content fetching
└── README.md          # This file
```

## Architecture

The crawler is designed with clean separation of concerns:

- **index.ts**: Orchestrates the crawling process, handles output
- **input-source.ts**: Detects input type (file/URL/list) and processes accordingly
- **fetch-url.ts**: Handles HTTP/HTTPS requests for URL sources
- **parse-html.ts**: Pure HTML-to-markdown conversion logic
