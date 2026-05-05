import { db } from '~/utils/db.server';

export async function querySeasonBySlug(slug: string) {
  return db.season.findUnique({
    where: { slug },
    include: {
      practiceSessions: {
        orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          slug: true,
          name: true,
          scheduledAt: true,
          sessionLength: true,
        },
      },
    },
  });
}
