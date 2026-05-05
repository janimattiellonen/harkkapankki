import type { Prisma } from '@prisma/client';
import type { CreatePracticeSessionData } from '~/repositories/queryCreatePracticeSession.server';

export async function queryCreatePracticeSessionTx(
  tx: Prisma.TransactionClient,
  data: CreatePracticeSessionData
) {
  return tx.practiceSession.create({
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
  });
}
