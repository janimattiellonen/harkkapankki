import { db } from '~/utils/db.server';

export type QueryPracticeSessionsOptions = {
  standaloneOnly?: boolean;
};

export async function queryPracticeSessions(options: QueryPracticeSessionsOptions = {}) {
  return db.practiceSession.findMany({
    where: options.standaloneOnly ? { seasonId: null } : undefined,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          sectionItems: true,
        },
      },
      retrospective: {
        select: { id: true },
      },
    },
  });
}
