# Scripts

Utility scripts for managing the Harkkapankki application.

## Available Scripts

### Content Management

#### `insert-content.ts`

Inserts exercise content into the database from JSON files.

**Purpose**: Import parsed exercise data (typically from the crawler) into the database.

**Usage**:

```bash
npm run insert-exercises -- <path-to-json-file> <exercise-type-id>
# or
npx tsx scripts/insert-content.ts <path-to-json-file> <exercise-type-id>
```

**Parameters**:

- `<path-to-json-file>`: Path to JSON file containing exercise data
- `<exercise-type-id>`: UUID of the exercise type to associate with the exercise

**JSON File Format**:

```json
{
  "header": "Exercise Title",
  "body": "Exercise content in markdown format with @[youtube](URL) tags..."
}
```

**Example**:

```bash
npm run insert-exercises -- ./docs/junnufriba-crawler/parsed-data/20240115-120000/content.json abc123-def456-789
```

**Validation**: The script validates that:

- JSON file contains required `header` and `body` properties
- Exercise type ID exists in the database
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

- `crawler/index.ts` - Parses HTML files from external sources
- `crawler/parse-html.ts` - HTML parsing and conversion logic

---

## Workflow Example

Here's a typical workflow for importing new exercise content:

1. **Parse HTML content** (if importing from external source):

   ```bash
   npx tsx scripts/crawler/index.ts docs/junnufriba-crawler/exercise.html
   ```

2. **Insert parsed content into database**:

   ```bash
   npm run insert-exercises -- docs/junnufriba-crawler/parsed-data/[timestamp]/content.json [exercise-type-id]
   ```

3. **Verify slugs** (optional):

   ```bash
   npx tsx scripts/test-slugs.ts
   ```

4. **Regenerate slugs** (if needed):
   ```bash
   npx tsx scripts/regenerate-slugs.ts
   ```

---

## Notes

- All scripts use TypeScript and require the `tsx` package to run
- Scripts connect to the database using Prisma Client
- Ensure your `.env` file is properly configured with `DATABASE_URL`
- Run scripts from the project root directory
