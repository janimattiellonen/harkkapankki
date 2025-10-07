import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function testSlugs() {
  console.log('Testing exercise slugs...\n');

  const exercises = await db.exercise.findMany({
    take: 3,
  });

  console.log('Raw data from database:');
  exercises.forEach(ex => {
    console.log({
      id: ex.id,
      name: ex.name,
      slug: ex.slug,
      hasSlug: !!ex.slug,
    });
  });

  console.log('\n---\n');

  console.log('Testing practice session slugs...\n');

  const sessions = await db.practiceSession.findMany({
    take: 3,
  });

  console.log('Raw data from database:');
  sessions.forEach(session => {
    console.log({
      id: session.id,
      name: session.name,
      slug: session.slug,
      hasSlug: !!session.slug,
    });
  });

  await db.$disconnect();
}

testSlugs();
