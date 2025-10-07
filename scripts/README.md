# Scripts

Utility scripts for managing the Harkkapankki application.

## Available Scripts

### Content Management

#### `insert-content.ts`

Inserts exercise content into the database from JSON files. Supports both single exercise objects and arrays of exercises.

**Purpose**: Import parsed exercise data (typically from the crawler) into the database.

**Usage**:

```bash
npm run insert-exercises -- <path-to-json-file> [exercise-type-id]
# or
npx tsx scripts/insert-content.ts <path-to-json-file> [exercise-type-id]
```

**Parameters**:

- `<path-to-json-file>`: Path to JSON file containing exercise data (single object or array)
- `[exercise-type-id]`: (Optional) UUID of the exercise type to associate with all exercises. If not provided, `exerciseTypeId` must be specified in the JSON data for each exercise.

**JSON File Format**:

**Single exercise:**

```json
{
  "header": "Exercise Title",
  "body": "Exercise content in markdown format with @[youtube](URL) tags...",
  "exerciseTypeId": "abc-123-def"
}
```

**Multiple exercises (array):**

```json
[
  {
    "header": "Exercise 1",
    "body": "Content for first exercise...",
    "exerciseTypeId": "abc-123-def"
  },
  {
    "header": "Exercise 2",
    "body": "Content for second exercise...",
    "exerciseTypeId": "xyz-789-ghi"
  }
]
```

**Examples**:

```bash
# Using exerciseTypeId from JSON file
npm run insert-exercises -- ./docs/junnufriba-crawler/parsed-data/2025-10-07_09-10-16-199Z/content.json

# Overriding exerciseTypeId for all exercises
npm run insert-exercises -- ./docs/junnufriba-crawler/parsed-data/2025-10-07_09-10-16-199Z/content.json abc123-def456-789
```

**Features**:

- Automatically generates unique slugs from exercise headers
- Handles duplicate slugs by appending numeric suffixes
- Validates all data before insertion
- Processes multiple exercises in a single run
- Shows detailed progress for each exercise
- Supports per-exercise exercise type IDs or global override via command line

**Validation**: The script validates that:

- JSON file contains required `header`, `body`, and `exerciseTypeId` properties for each exercise
- All exercise type IDs exist in the database
- All data is properly formatted

---

### Database Maintenance

#### `regenerate-slugs.ts`

Regenerates slugs for all exercises and practice sessions in the database.

**Purpose**: Update slugs based on current names, useful after bulk imports or name changes.

**Usage**:

```bash
npx tsx scripts/regenerate-slugs.ts
```

**What it does**:

- Regenerates slugs for all exercises based on their names
- Regenerates slugs for all practice sessions based on their names
- Handles duplicate slugs by appending numeric suffixes (e.g., `exercise`, `exercise-2`, `exercise-3`)
- Updates the database with new slugs

**When to use**:

- After importing exercises without proper slugs
- After renaming multiple items
- To ensure slug uniqueness and consistency

---

#### `test-slugs.ts`

Tests and verifies slug generation for exercises and practice sessions.

**Purpose**: Diagnostic tool to check if slugs are properly generated.

**Usage**:

```bash
npx tsx scripts/test-slugs.ts
```

**Output**: Displays sample records showing:

- ID
- Name
- Slug
- Whether slug exists

**When to use**:

- To verify slugs after database operations
- To debug slug-related issues
- To check data integrity

---

### Content Crawling

See [crawler/README.md](./crawler/README.md) for detailed documentation on the HTML crawler scripts.

**Quick Overview**:

- `crawler/index.ts` - Parses HTML from multiple input sources (files, URLs, or lists)
- `crawler/parse-html.ts` - HTML parsing and markdown conversion logic
- `crawler/input-source.ts` - Input source detection and handling
- `crawler/fetch-url.ts` - URL content fetching

**Supported Input Methods**:

1. **HTML file path** - Parse a single local HTML file
2. **URL** - Fetch and parse content directly from a web page
3. **List file (.txt)** - Process multiple files/URLs in a single run

---

## Workflow Examples

### Single Exercise Import

Importing one exercise from an HTML file or URL:

1. **Parse HTML content**:

   ```bash
   # From HTML file
   npx tsx scripts/crawler/index.ts docs/junnufriba-crawler/exercise.html
   # Or from URL
   npx tsx scripts/crawler/index.ts https://example.com/exercises/backhand
   ```

2. **Insert parsed content into database**:

   ```bash
   npm run insert-exercises -- docs/junnufriba-crawler/parsed-data/[timestamp]/content.json [exercise-type-id]
   ```

3. **Verify slugs** (optional):

   ```bash
   npx tsx scripts/test-slugs.ts
   ```

### Bulk Exercise Import

Importing multiple exercises from a list file:

1. **Create list file** (`sources.txt`):

   ```
   docs/junnufriba-crawler/rystyheitto.html
   https://example.com/exercises/backhand
   docs/junnufriba-crawler/kammenheitto.html
   # Comments starting with # are ignored
   https://example.com/exercises/forehand
   ```

2. **Parse all sources**:

   ```bash
   npx tsx scripts/crawler/index.ts sources.txt
   ```

   This creates a single timestamped directory with `content.json` containing an array of all exercises.

3. **Manually edit the JSON file** to add `exerciseTypeId` to each exercise:

   ```json
   [
     {
       "header": "Rystyheitto",
       "body": "...",
       "exerciseTypeId": "abc-123-def"
     },
     {
       "header": "Kammenheitto",
       "body": "...",
       "exerciseTypeId": "abc-123-def"
     }
   ]
   ```

4. **Insert all exercises into database**:

   ```bash
   npm run insert-exercises -- docs/junnufriba-crawler/parsed-data/[timestamp]/content.json
   ```

5. **Regenerate slugs** (if needed):
   ```bash
   npx tsx scripts/regenerate-slugs.ts
   ```

---

## Notes

- All scripts use TypeScript and require the `tsx` package to run
- Scripts connect to the database using Prisma Client
- Ensure your `.env` file is properly configured with `DATABASE_URL`
- Run scripts from the project root directory
