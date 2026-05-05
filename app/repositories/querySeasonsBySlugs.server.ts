import { db } from '~/utils/db.server';

export async function querySeasonsBySlugs(slugs: string[]) {
  return db.season.findMany({
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
