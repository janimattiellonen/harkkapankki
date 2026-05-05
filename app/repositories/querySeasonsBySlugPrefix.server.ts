import { db } from '~/utils/db.server';

export async function querySeasonsBySlugPrefix(prefix: string) {
  return db.season.findMany({
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
