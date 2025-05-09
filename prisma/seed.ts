import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seed() {
  try {
    // First, clean the existing data
    await db.exercise.deleteMany({});
    console.log('Cleaned existing data');

    // Create sample exercises
    const exercises = [
      {
        name: "Putting Practice - Basic",
        description: "Basic putting practice from different distances",
        content: "1. Set up markers at 3m, 5m, and 7m\n2. Practice 10 putts from each distance\n3. Focus on consistent form and follow-through",
        duration: 15,
        youtubeVideo: "https://youtube.com/watch?example-putting",
      },
      {
        name: "Approach Shot Warmup",
        description: "Warming up approach shots with different discs",
        content: "1. Practice approach shots from 20-30m\n2. Use both forehand and backhand throws\n3. Focus on landing zone accuracy",
        duration: 20,
        youtubeVideo: null,
      },
      {
        name: "Drive Form Practice",
        description: "Working on proper drive form and technique",
        content: "1. Start with standstill drives\n2. Progress to x-step technique\n3. Focus on reach back and follow through",
        duration: 25,
        youtubeVideo: "https://youtube.com/watch?example-drive-form",
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