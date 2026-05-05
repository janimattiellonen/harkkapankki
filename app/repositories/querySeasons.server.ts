import { db } from '~/utils/db.server';

export async function querySeasons() {
  return db.season.findMany({
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          practiceSessions: true,
        },
      },
    },
  });
}
