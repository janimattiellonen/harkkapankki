import { db } from "~/utils/db.server";

type CreatePracticeSessionData = {
  name?: string;
  description?: string;
  sessionLength: number;
  sectionItems: Array<{
    sectionId: string;
    exerciseTypeId: string;
    order: number;
  }>;
};

export async function createPracticeSession(data: CreatePracticeSessionData) {
  return db.practiceSession.create({
    data: {
      name: data.name || null,
      description: data.description || null,
      sessionLength: data.sessionLength,
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

export async function findAllPracticeSessions() {
  return db.practiceSession.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          sectionItems: true,
        },
      },
    },
  });
}
