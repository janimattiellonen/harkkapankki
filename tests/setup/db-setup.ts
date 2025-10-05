import { beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Override DATABASE_URL for tests
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5436/harkka_db_test';

const db = new PrismaClient();

// Run before each test suite
beforeEach(async () => {
  // Clean all tables in reverse order (respecting foreign keys)
  await db.exercise.deleteMany({});
  await db.exerciseTypeTranslation.deleteMany({});
  await db.exerciseType.deleteMany({});
});

// Run once after all tests
afterAll(async () => {
  await db.$disconnect();
});

export { db };
