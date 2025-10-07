# Junnufriba HTML Crawler

This script parses HTML files from junnufriba.fi and converts them to markdown format suitable for importing into the database.

## Features

- Extracts page title from `<header class="entry-header">`
- Extracts and converts content from `<div class="entry-content">`
- Converts HTML to markdown:
  - `<h2>` and `<h3>` → `##` markdown headings
  - Bullet lists with `•` → proper markdown unordered lists
  - YouTube iframes → `@[youtube](URL)` tags
  - Images → markdown format with `/public/uploads/` prefix
- Downloads images to the output directory
- Saves structured JSON data for database import
- Creates timestamped output directories to avoid conflicts

## Usage

### Parse a local HTML file

```bash
npx tsx scripts/crawler/index.ts <path-to-html-file>
```

### Example

```bash
npx tsx scripts/crawler/index.ts docs/junnufriba-crawler/rystyheitto.html
```

## Output

The script creates a timestamped directory under `docs/junnufriba-crawler/parsed-data/` with:

- `content.json` - Structured data ready for database import
- `content.md` - Markdown preview for manual inspection
- Downloaded images (if any)

### JSON Structure

```json
{
  "header": "Page Title",
  "body": "Markdown content with @[youtube](URL) tags..."
}
```

## Next Steps

After parsing:

1. **Manual Review**: Check the generated markdown in `content.md`
2. **Adjust if needed**: Edit the JSON file if necessary
3. **Import to Database**: Use a separate import script (to be created) to insert the data

## Notes

- The parsed data directory is in `.gitignore` to avoid committing large amounts of parsed content
- Images are saved with the path prefix `/public/uploads/` as expected by the application
- YouTube videos are converted to the app's custom `@[youtube](URL)` format
- Duplicate runs create new timestamped directories, preserving previous parses

## File Structure

```
scripts/crawler/
├── index.ts           # Main script
├── parse-html.ts      # HTML parsing and conversion logic
└── README.md          # This file
```

