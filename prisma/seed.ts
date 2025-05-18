import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type ExerciseTypeData = {
  slug: string;
  parentSlug?: string;
  translations: {
    fi: string;
    en: string;
  };
};

const exerciseTypes: ExerciseTypeData[] = [
  // Main categories
  { slug: 'technique', translations: { fi: 'Tekniikka', en: 'Technique' } },
  { slug: 'supplementary', translations: { fi: 'Oheisharjoitteet', en: 'Supplementary exercises' } },
  { slug: 'games', translations: { fi: 'Pelit ja haasteet', en: 'Games, plays and challenges' } },
  
  // Technique subcategories
  { slug: 'backhand', parentSlug: 'technique', translations: { fi: 'Rystyheitto', en: 'Backhand' } },
  { slug: 'sidearm', parentSlug: 'technique', translations: { fi: 'Kämmenheitto', en: 'Sidearm' } },
  { slug: 'putting', parentSlug: 'technique', translations: { fi: 'Puttaaminen', en: 'Putting' } },
  
  // Supplementary subcategories
  { slug: 'motor-skills', parentSlug: 'supplementary', translations: { fi: 'Motoriikkaharjoitteet', en: 'Motor skills exercises' } },
  { slug: 'strength', parentSlug: 'supplementary', translations: { fi: 'Voimaharjoitteet', en: 'Strength training exercises' } },
  { slug: 'warm-up', parentSlug: 'supplementary', translations: { fi: 'Alkulämmittely', en: 'Warm-up exercises' } },
  
  // Games subcategories
  { slug: 'throwing-games', parentSlug: 'games', translations: { fi: 'Heittopelit', en: 'Throwing games' } },
  { slug: 'warm-up-games', parentSlug: 'games', translations: { fi: 'Lämmittelypelit', en: 'Warm-up games' } },
  { slug: 'putting-games', parentSlug: 'games', translations: { fi: 'Puttipelit', en: 'Putting games' } },
];

async function seed() {
  try {
    // Clean existing data
    await db.exercise.deleteMany({});
    await db.exerciseTypeTranslation.deleteMany({});
    await db.exerciseType.deleteMany({});
    console.log('Cleaned existing data');

    // Create exercise types with hierarchy
    const slugToId: Record<string, string> = {};

    // First create all types without parents
    for (const type of exerciseTypes) {
      if (!type.parentSlug) {
        const created = await db.exerciseType.create({
          data: {
            slug: type.slug,
          },
        });
        slugToId[type.slug] = created.id;
      }
    }

    // Then create types with parents
    for (const type of exerciseTypes) {
      if (type.parentSlug) {
        const created = await db.exerciseType.create({
          data: {
            slug: type.slug,
            parentId: slugToId[type.parentSlug],
          },
        });
        slugToId[type.slug] = created.id;
      }
    }

    // Create translations
    for (const type of exerciseTypes) {
      const typeId = slugToId[type.slug];
      
      // Finnish translation
      await db.exerciseTypeTranslation.create({
        data: {
          exerciseTypeId: typeId,
          language: 'fi',
          name: type.translations.fi,
        },
      });

      // English translation
      await db.exerciseTypeTranslation.create({
        data: {
          exerciseTypeId: typeId,
          language: 'en',
          name: type.translations.en,
        },
      });
    }

    // Create sample exercises
    const exercises = [
      {
        name: "Putting Practice - Basic",
        description: "Basic putting practice from different distances",
        content: "1. Set up markers at 3m, 5m, and 7m\n2. Practice 10 putts from each distance\n3. Focus on consistent form and follow-through",
        duration: 15,
        youtubeVideo: "https://youtube.com/watch?example-putting",
        exerciseTypeId: slugToId['putting'],
      },
      {
        name: "Approach Shot Warmup",
        description: "Warming up approach shots with different discs",
        content: "1. Practice approach shots from 20-30m\n2. Use both forehand and backhand throws\n3. Focus on landing zone accuracy",
        duration: 20,
        youtubeVideo: null,
        exerciseTypeId: slugToId['warm-up'],
      },
      {
        name: "Drive Form Practice",
        description: "Working on proper drive form and technique",
        content: "1. Start with standstill drives\n2. Progress to x-step technique\n3. Focus on reach back and follow through",
        duration: 25,
        youtubeVideo: "https://youtube.com/watch?example-drive-form",
        exerciseTypeId: slugToId['backhand'],
      },
    ];

    for (const exercise of exercises) {
      const created = await db.exercise.create({
        data: exercise,
      });
      console.log(`Created exercise: ${created.name}`);
    }

    console.log(`Database has been seeded. 🌱`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });