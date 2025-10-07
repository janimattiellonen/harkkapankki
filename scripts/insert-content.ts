/**
 * Insert Content Script
 *
 * Inserts exercise content into the database from JSON files.
 *
 * Usage:
 *   npm run insert-exercises -- <path-to-json-file> [exercise-type-id]
 *   npx tsx scripts/insert-content.ts <path-to-json-file> [exercise-type-id]
 *
 * Parameters:
 *   - path-to-json-file: Path to JSON file containing exercise data
 *   - exercise-type-id: (Optional) UUID of the exercise type to associate with all exercises.
 *                       If not provided, exerciseTypeId must be specified in the JSON data.
 *
 * JSON Format (supports both single object and array):
 *   Single: { "header": "Title", "body": "Content...", "exerciseTypeId": "abc-123" }
 *   Array: [{ "header": "Title 1", "body": "Content...", "exerciseTypeId": "abc-123" }, ...]
 *
 * Examples:
 *   npm run insert-exercises -- ./docs/crawler/parsed-data/20240115/content.json
 *   npm run insert-exercises -- ./docs/crawler/parsed-data/20240115/content.json abc-123-def
 */

import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

const db = new PrismaClient();

type ExerciseData = {
  header: string;
  body: string;
  exerciseTypeId: string;
};

type ValidationResult = {
  isValid: boolean;
  missingProperties: string[];
};

function validateExerciseData(data: unknown): ValidationResult {
  const missingProperties: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      missingProperties: ['data is not an object'],
    };
  }

  const exercise = data as Partial<ExerciseData>;

  if (!exercise.header || typeof exercise.header !== 'string') {
    missingProperties.push('header');
  }

  if (!exercise.body || typeof exercise.body !== 'string') {
    missingProperties.push('body');
  }

  if (!exercise.exerciseTypeId || typeof exercise.exerciseTypeId !== 'string') {
    missingProperties.push('exerciseTypeId');
  }

  return {
    isValid: missingProperties.length === 0,
    missingProperties,
  };
}

// Slugify function (same as in app/utils/slugify.ts)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function insertExercises(jsonFilePath: string, exerciseTypeId?: string) {
  try {
    console.log(`Reading JSON file: ${jsonFilePath}\n`);

    const absolutePath = resolve(jsonFilePath);
    const fileContent = await readFile(absolutePath, 'utf-8');
    const rawData = JSON.parse(fileContent);

    // Support both single object and array
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];

    console.log(`Found ${dataArray.length} exercise(s) to insert\n`);

    // Apply command-line exerciseTypeId if provided, otherwise use from JSON
    const exercises = dataArray.map(data => ({
      ...data,
      exerciseTypeId: exerciseTypeId || data.exerciseTypeId,
    })) as ExerciseData[];

    // Validate all exercises
    for (const [index, exercise] of exercises.entries()) {
      const validation = validateExerciseData(exercise);

      if (!validation.isValid) {
        console.error(`❌ Invalid data structure for exercise ${index + 1}.`);
        console.error(`Missing or invalid properties: ${validation.missingProperties.join(', ')}`);
        process.exit(1);
      }
    }

    // Verify that all exercise types exist
    const uniqueExerciseTypeIds = [...new Set(exercises.map(e => e.exerciseTypeId))];
    console.log(`Verifying ${uniqueExerciseTypeIds.length} exercise type(s)...`);

    for (const typeId of uniqueExerciseTypeIds) {
      const exerciseType = await db.exerciseType.findUnique({
        where: { id: typeId },
      });

      if (!exerciseType) {
        console.error(`❌ Exercise type with ID ${typeId} not found in database.`);
        process.exit(1);
      }

      console.log(`  ✓ Exercise type found: ${exerciseType.slug}`);
    }

    console.log();

    // Get all existing slugs for uniqueness checking
    const allExistingSlugs = await db.exercise.findMany({
      select: { slug: true },
    });

    const existingSlugSet = new Set(allExistingSlugs.map(e => e.slug));

    // Process each exercise
    const createdExercises = [];

    for (const [index, exerciseData] of exercises.entries()) {
      console.log(
        `\n[${index + 1}/${exercises.length}] Creating exercise: "${exerciseData.header}"...`
      );

      // Generate unique slug
      const baseSlug = slugify(exerciseData.header);
      let finalSlug = baseSlug;
      let counter = 1;

      while (existingSlugSet.has(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      existingSlugSet.add(finalSlug); // Add to set for next iterations

      console.log(`  Slug: ${finalSlug}`);
      console.log(`  Exercise Type: ${exerciseData.exerciseTypeId}`);
      console.log(`  Content length: ${exerciseData.body.length} characters`);

      // Create the exercise
      const exercise = await db.exercise.create({
        data: {
          slug: finalSlug,
          name: exerciseData.header,
          content: exerciseData.body,
          description: null,
          image: null,
          youtubeVideo: null,
          duration: 0,
          exerciseType: {
            connect: { id: exerciseData.exerciseTypeId },
          },
        },
      });

      console.log(`  ✅ Created! ID: ${exercise.id}`);
      createdExercises.push(exercise);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Successfully created ${createdExercises.length} exercise(s)!`);
    console.log(`${'='.repeat(60)}`);
    createdExercises.forEach((ex, i) => {
      console.log(`\n${i + 1}. ${ex.name}`);
      console.log(`   ID: ${ex.id}`);
      console.log(`   Slug: ${ex.slug}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        console.error(`❌ File not found: ${jsonFilePath}`);
      } else if (error.message.includes('JSON')) {
        console.error(`❌ Invalid JSON in file: ${jsonFilePath}`);
        console.error(`   ${error.message}`);
      } else {
        console.error('❌ Error inserting exercise:', error.message);
      }
    } else {
      console.error('❌ Unknown error:', error);
    }
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Get the file path and optional exercise type ID from command line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('❌ Usage: npm run insert-exercises -- <path-to-json-file> [exercise-type-id]');
  console.error('\nExamples:');
  console.error(
    '  npm run insert-exercises -- docs/junnufriba-crawler/parsed-data/2025-10-07_09-10-16-199Z/content.json'
  );
  console.error(
    '  npm run insert-exercises -- docs/junnufriba-crawler/parsed-data/2025-10-07_09-10-16-199Z/content.json abc-123-def'
  );
  console.error(
    '\nNote: The JSON file can contain either a single exercise object or an array of exercise objects.'
  );
  console.error(
    '      If exercise-type-id is not provided as a parameter, it must be specified in the JSON data.'
  );
  process.exit(1);
}

const jsonFilePath = args[0];
const exerciseTypeId = args[1]; // Optional

insertExercises(jsonFilePath, exerciseTypeId);
