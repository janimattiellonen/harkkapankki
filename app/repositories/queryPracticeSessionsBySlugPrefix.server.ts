import { db } from '~/utils/db.server';

export async function queryPracticeSessionsBySlugPrefix(prefix: string) {
  return db.practiceSession.findMany({
    where: {
      slug: {
        startsWith: prefix,
      },
    },
    select: {
      slug: true,
    },
  });
}
