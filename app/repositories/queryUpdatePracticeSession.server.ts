import { db } from '~/utils/db.server';

export type UpdatePracticeSessionData = {
  name?: string;
  description?: string;
  sessionLength: number;
  scheduledAt?: Date | null;
  sectionItems: Array<{
    sectionId: string;
    exerciseTypeId: string;
    exerciseId?: string | null;
    order: number;
  }>;
};

export async function queryUpdatePracticeSession(id: string, data: UpdatePracticeSessionData) {
  return db.$transaction(async tx => {
    await tx.practiceSessionSectionItem.deleteMany({
      where: { practiceSessionId: id },
    });

    return tx.practiceSession.update({
      where: { id },
      data: {
        name: data.name || null,
        description: data.description || null,
        sessionLength: data.sessionLength,
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
  });
}
