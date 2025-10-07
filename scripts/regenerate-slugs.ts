import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

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

async function regenerateSlugs() {
  try {
    console.log('Starting slug regeneration...\n');

    // Regenerate exercise slugs
    console.log('Regenerating exercise slugs...');
    const exercises = await db.exercise.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const exerciseSlugCounts = new Map<string, number>();

    for (const exercise of exercises) {
      const baseSlug = slugify(exercise.name);

      // Handle duplicates
      const count = exerciseSlugCounts.get(baseSlug) || 0;
      exerciseSlugCounts.set(baseSlug, count + 1);

      const finalSlug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;

      await db.exercise.update({
        where: { id: exercise.id },
        data: { slug: finalSlug },
      });

      console.log(`  ✓ "${exercise.name}" → ${finalSlug}`);
    }

    console.log(`\nUpdated ${exercises.length} exercises\n`);

    // Regenerate practice session slugs
    console.log('Regenerating practice session slugs...');
    const sessions = await db.practiceSession.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const sessionSlugCounts = new Map<string, number>();

    for (const session of sessions) {
      const baseName = session.name && session.name.trim() !== ''
        ? session.name
        : 'practice-session';

      const baseSlug = slugify(baseName);

      // Handle duplicates
      const count = sessionSlugCounts.get(baseSlug) || 0;
      sessionSlugCounts.set(baseSlug, count + 1);

      const finalSlug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;

      await db.practiceSession.update({
        where: { id: session.id },
        data: { slug: finalSlug },
      });

      const displayName = session.name || '(Untitled)';
      console.log(`  ✓ "${displayName}" → ${finalSlug}`);
    }

    console.log(`\nUpdated ${sessions.length} practice sessions\n`);
    console.log('✅ Slug regeneration completed successfully!');

  } catch (error) {
    console.error('❌ Error regenerating slugs:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

regenerateSlugs();
