import { db } from '~/utils/db.server';

export async function queryPracticeSessionById(id: string, language: string) {
  return db.practiceSession.findUnique({
    where: { id },
    include: {
      season: {
        select: { slug: true, name: true },
      },
      sectionItems: {
        orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
        include: {
          section: {
            include: {
              translations: {
                where: { language },
              },
            },
          },
          exerciseType: {
            include: {
              translations: {
                where: { language },
              },
            },
          },
          exercise: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
}
