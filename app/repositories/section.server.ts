import { db } from "~/utils/db.server";

export type SectionWithDetails = {
  id: string;
  slug: string;
  order: number;
  name: string;
  description: string | null;
  durationConfigs: { sessionLength: number; duration: number }[];
  exerciseTypes: { id: string; name: string }[];
};

export async function findAllSectionsWithDetails(language: string = 'en'): Promise<SectionWithDetails[]> {
  const sections = await db.section.findMany({
    orderBy: { order: 'asc' },
    include: {
      translations: {
        where: { language },
        select: { name: true, description: true },
      },
      durationConfigs: {
        select: { sessionLength: true, duration: true },
        orderBy: { sessionLength: 'asc' },
      },
      exerciseTypeLinks: {
        include: {
          exerciseType: {
            include: {
              translations: {
                where: { language },
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  return sections.map(section => ({
    id: section.id,
    slug: section.slug,
    order: section.order,
    name: section.translations[0]?.name || section.slug,
    description: section.translations[0]?.description || null,
    durationConfigs: section.durationConfigs,
    exerciseTypes: section.exerciseTypeLinks.map(link => ({
      id: link.exerciseType.id,
      name: link.exerciseType.translations[0]?.name || link.exerciseType.slug,
    })),
  }));
}
