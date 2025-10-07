import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import { resolve } from "path";

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

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      missingProperties: ["data is not an object"],
    };
  }

  const exercise = data as Partial<ExerciseData>;

  if (!exercise.header || typeof exercise.header !== "string") {
    missingProperties.push("header");
  }

  if (!exercise.body || typeof exercise.body !== "string") {
    missingProperties.push("body");
  }

  if (!exercise.exerciseTypeId || typeof exercise.exerciseTypeId !== "string") {
    missingProperties.push("exerciseTypeId");
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
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function insertExercises(jsonFilePath: string) {
  try {
    console.log(`Reading JSON file: ${jsonFilePath}\n`);

    const absolutePath = resolve(jsonFilePath);
    const fileContent = await readFile(absolutePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Validate that data is an object with expected properties
    const validation = validateExerciseData(data);

    if (!validation.isValid) {
      console.error("❌ Invalid data structure in JSON file.");
      console.error(
        `Missing or invalid properties: ${validation.missingProperties.join(", ")}`
      );
      process.exit(1);
    }

    const exerciseData = data as ExerciseData;

    // Verify that the exercise type exists
    console.log(`Verifying exercise type: ${exerciseData.exerciseTypeId}...`);
    const exerciseType = await db.exerciseType.findUnique({
      where: { id: exerciseData.exerciseTypeId },
    });

    if (!exerciseType) {
      console.error(
        `❌ Exercise type with ID ${exerciseData.exerciseTypeId} not found in database.`
      );
      process.exit(1);
    }

    console.log(`✓ Exercise type found: ${exerciseType.slug}\n`);

    // Generate slug from header
    const baseSlug = slugify(exerciseData.header);

    // Check for existing slugs to ensure uniqueness
    const existingSlugs = await db.exercise.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: {
        slug: true,
      },
    });

    const existingSlugStrings = existingSlugs.map((e) => e.slug);
    let finalSlug = baseSlug;
    let counter = 1;

    while (existingSlugStrings.includes(finalSlug)) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    console.log(`Creating exercise: "${exerciseData.header}"...`);
    console.log(`  Slug: ${finalSlug}`);
    console.log(`  Exercise Type: ${exerciseType.slug}`);
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
        duration: 0, // Default duration, can be updated later
        exerciseType: {
          connect: { id: exerciseData.exerciseTypeId },
        },
      },
    });

    console.log(`\n✅ Exercise created successfully!`);
    console.log(`   ID: ${exercise.id}`);
    console.log(`   Name: ${exercise.name}`);
    console.log(`   Slug: ${exercise.slug}`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ENOENT")) {
        console.error(`❌ File not found: ${jsonFilePath}`);
      } else if (error.message.includes("JSON")) {
        console.error(`❌ Invalid JSON in file: ${jsonFilePath}`);
        console.error(`   ${error.message}`);
      } else {
        console.error("❌ Error inserting exercise:", error.message);
      }
    } else {
      console.error("❌ Unknown error:", error);
    }
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Get the file path from command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("❌ Usage: npm run insert-junnufriba-content <path-to-json-file>");
  console.error(
    "\nExample: npm run insert-junnufriba-content docs/junnufriba-crawler/parsed-data/2025-10-07_09-10-16-199Z/content.json"
  );
  process.exit(1);
}

const jsonFilePath = args[0];
insertExercises(jsonFilePath);
