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
  { slug: 'driving', parentSlug: 'technique', translations: { fi: 'Ajaminen', en: 'Driving' } },

  // Supplementary subcategories
  { slug: 'motor-skills', parentSlug: 'supplementary', translations: { fi: 'Motoriikkaharjoitteet', en: 'Motor skills exercises' } },
  { slug: 'strength', parentSlug: 'supplementary', translations: { fi: 'Voimaharjoitteet', en: 'Strength training exercises' } },
  { slug: 'warm-up', parentSlug: 'supplementary', translations: { fi: 'Alkulämmittely', en: 'Warm-up exercises' } },
  { slug: 'muscle-condition', parentSlug: 'supplementary', translations: { fi: 'Lihaskunto', en: 'Muscle condition' } },

  // Games subcategories
  { slug: 'throwing-games', parentSlug: 'games', translations: { fi: 'Heittopelit', en: 'Throwing games' } },
  { slug: 'warm-up-games', parentSlug: 'games', translations: { fi: 'Lämmittelypelit', en: 'Warm-up games' } },
  { slug: 'putting-games', parentSlug: 'games', translations: { fi: 'Puttipelit', en: 'Putting games' } },

  // Practice session specific types
  { slug: 'introduction', translations: { fi: 'Alku', en: 'Introduction' } },
  { slug: 'throwing-order', parentSlug: 'introduction', translations: { fi: 'Heittojärjestys', en: 'Throwing order' } },
  { slug: 'ob-rules', parentSlug: 'introduction', translations: { fi: 'OB-säännöt', en: 'OB rules' } },
  { slug: 'closing', translations: { fi: 'Lopetus', en: 'Closing' } },
];

async function seed() {
  try {
    // Clean existing data (in reverse order of dependencies)
    await db.exercise.deleteMany({});
    await db.sectionExerciseType.deleteMany({});
    await db.sectionDurationConfig.deleteMany({});
    await db.sectionTranslation.deleteMany({});
    await db.section.deleteMany({});
    await db.exerciseTypeGroupMember.deleteMany({});
    await db.exerciseTypeGroupTranslation.deleteMany({});
    await db.exerciseTypeGroup.deleteMany({});
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

    // Create exercise type groups
    console.log('Creating exercise type groups...');
    const exerciseFormGroup = await db.exerciseTypeGroup.create({
      data: { slug: 'exercise-form' },
    });
    const practiceSessionFormGroup = await db.exerciseTypeGroup.create({
      data: { slug: 'practice-session-form' },
    });

    // Create group translations
    await db.exerciseTypeGroupTranslation.createMany({
      data: [
        { groupId: exerciseFormGroup.id, language: 'fi', name: 'Harjoituslomake' },
        { groupId: exerciseFormGroup.id, language: 'en', name: 'Exercise Form' },
        { groupId: practiceSessionFormGroup.id, language: 'fi', name: 'Harjoituskerta lomake' },
        { groupId: practiceSessionFormGroup.id, language: 'en', name: 'Practice Session Form' },
      ],
    });

    // Assign exercise types to groups
    console.log('Assigning exercise types to groups...');

    // Exercise form group members (existing exercise types)
    const exerciseFormTypes = ['technique', 'backhand', 'sidearm', 'putting', 'driving', 'supplementary', 'motor-skills', 'strength', 'warm-up', 'muscle-condition', 'games', 'throwing-games', 'warm-up-games', 'putting-games'];
    for (const slug of exerciseFormTypes) {
      await db.exerciseTypeGroupMember.create({
        data: {
          groupId: exerciseFormGroup.id,
          exerciseTypeId: slugToId[slug],
        },
      });
    }

    // Practice session form group members (includes all types + session-specific)
    const sessionFormTypes = ['introduction', 'throwing-order', 'ob-rules', 'motor-skills', 'muscle-condition', 'putting', 'driving', 'closing'];
    for (const slug of sessionFormTypes) {
      await db.exerciseTypeGroupMember.create({
        data: {
          groupId: practiceSessionFormGroup.id,
          exerciseTypeId: slugToId[slug],
        },
      });
    }

    // Create sections
    console.log('Creating sections...');
    const introSection = await db.section.create({
      data: { slug: 'introduction', order: 1 },
    });
    const warmUpSection = await db.section.create({
      data: { slug: 'warm-up', order: 2 },
    });
    const techniqueSection = await db.section.create({
      data: { slug: 'technique', order: 3 },
    });
    const closingSection = await db.section.create({
      data: { slug: 'closing', order: 4 },
    });

    // Create section translations
    await db.sectionTranslation.createMany({
      data: [
        { sectionId: introSection.id, language: 'fi', name: 'Alku' },
        { sectionId: introSection.id, language: 'en', name: 'Introduction' },
        { sectionId: warmUpSection.id, language: 'fi', name: 'Alkulämmittely' },
        { sectionId: warmUpSection.id, language: 'en', name: 'Warm-up' },
        { sectionId: techniqueSection.id, language: 'fi', name: 'Tekniikka' },
        { sectionId: techniqueSection.id, language: 'en', name: 'Technique' },
        { sectionId: closingSection.id, language: 'fi', name: 'Lopetus' },
        { sectionId: closingSection.id, language: 'en', name: 'Closing' },
      ],
    });

    // Create section duration configs
    console.log('Creating section duration configs...');
    await db.sectionDurationConfig.createMany({
      data: [
        // Introduction - 5 min for both session lengths
        { sectionId: introSection.id, sessionLength: 60, duration: 5 },
        { sectionId: introSection.id, sessionLength: 90, duration: 5 },
        // Warm-up - 10 min for 60, 20 min for 90
        { sectionId: warmUpSection.id, sessionLength: 60, duration: 10 },
        { sectionId: warmUpSection.id, sessionLength: 90, duration: 20 },
        // Technique - 40 min for 60, 60 min for 90
        { sectionId: techniqueSection.id, sessionLength: 60, duration: 40 },
        { sectionId: techniqueSection.id, sessionLength: 90, duration: 60 },
        // Closing - 5 min for both
        { sectionId: closingSection.id, sessionLength: 60, duration: 5 },
        { sectionId: closingSection.id, sessionLength: 90, duration: 5 },
      ],
    });

    // Link exercise types to sections
    console.log('Linking exercise types to sections...');
    await db.sectionExerciseType.createMany({
      data: [
        // Introduction section
        { sectionId: introSection.id, exerciseTypeId: slugToId['throwing-order'] },
        { sectionId: introSection.id, exerciseTypeId: slugToId['ob-rules'] },
        // Warm-up section
        { sectionId: warmUpSection.id, exerciseTypeId: slugToId['motor-skills'] },
        { sectionId: warmUpSection.id, exerciseTypeId: slugToId['muscle-condition'] },
        // Technique section
        { sectionId: techniqueSection.id, exerciseTypeId: slugToId['putting'] },
        { sectionId: techniqueSection.id, exerciseTypeId: slugToId['driving'] },
        // Closing section
        { sectionId: closingSection.id, exerciseTypeId: slugToId['closing'] },
      ],
    });

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