import { db } from '~/utils/db.server';

export async function querySeasonBySlugWithCoverage(slug: string, language: string) {
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
          sectionItems: {
            select: {
              sectionId: true,
              exerciseTypeId: true,
              exerciseId: true,
              exerciseType: {
                select: {
                  id: true,
                  slug: true,
                  translations: {
                    where: { language },
                    select: { name: true },
                  },
                },
              },
              exercise: {
                select: { id: true, slug: true, name: true },
              },
            },
          },
        },
      },
    },
  });
}
