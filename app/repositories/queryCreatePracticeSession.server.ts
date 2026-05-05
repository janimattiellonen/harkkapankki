import { db } from '~/utils/db.server';

type SessionSectionItemInput = {
  sectionId: string;
  exerciseTypeId: string;
  exerciseId?: string | null;
  order: number;
};

export type CreatePracticeSessionData = {
  slug: string;
  name?: string;
  description?: string;
  sessionLength: number;
  seasonId?: string | null;
  scheduledAt?: Date | null;
  sectionItems: SessionSectionItemInput[];
};

export async function queryCreatePracticeSession(data: CreatePracticeSessionData) {
  return db.practiceSession.create({
    data: {
      slug: data.slug,
      name: data.name || null,
      description: data.description || null,
      sessionLength: data.sessionLength,
      seasonId: data.seasonId ?? null,
      scheduledAt: data.scheduledAt ?? null,
      sectionItems: {
        create: data.sectionItems,
      },
    },
    include: {
      sectionItems: {
        include: {
          section: {
            include: {
              translations: true,
            },
          },
          exerciseType: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });
}
