import { db } from '~/utils/db.server';

export async function queryPracticeSessionsBySlugs(slugs: string[]) {
  return db.practiceSession.findMany({
    where: {
      slug: {
        in: slugs,
      },
    },
    select: {
      slug: true,
    },
  });
}
