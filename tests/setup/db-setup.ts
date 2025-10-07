import { beforeEach, afterAll } from 'vitest';

// Override DATABASE_URL for tests BEFORE importing db
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5436/harkka_db_test';

// Import db from the application's db singleton
import { db } from '~/utils/db.server';

// Run before each test
beforeEach(async (context) => {
  // Only clean database for tests that need it (skip for tests that don't use the database)
  // Check if the test file path includes '/services/' to determine if it needs DB cleanup
  const testPath = context.task.file?.filepath || '';
  const needsDbCleanup = testPath.includes('/services/') || testPath.includes('\\services\\');

  if (!needsDbCleanup) {
    return;
  }

  // Clean all tables - use TRUNCATE with CASCADE for efficiency
  await db.$executeRaw`TRUNCATE TABLE exercise_types RESTART IDENTITY CASCADE`;
});

// Run once after all tests
afterAll(async () => {
  await db.$disconnect();
});

export { db };
