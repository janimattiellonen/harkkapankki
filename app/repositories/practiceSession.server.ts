import { db } from '~/utils/db.server';

type CreatePracticeSessionData = {
  slug: string;
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
      slug: data.slug,
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

export async function findPracticeSessionById(id: string, language: string) {
  return db.practiceSession.findUnique({
    where: { id },
    include: {
      sectionItems: {
        orderBy: [{ sectionId: 'asc' }, { order: 'asc' }],
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
        },
      },
    },
  });
}

export async function findPracticeSessionBySlug(slug: string, language: string) {
  return db.practiceSession.findUnique({
    where: { slug },
    include: {
      sectionItems: {
        orderBy: [{ sectionId: 'asc' }, { order: 'asc' }],
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
        },
      },
    },
  });
}

export async function findPracticeSessionsBySlugs(slugs: string[]) {
  return db.practiceSession.findMany({
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
