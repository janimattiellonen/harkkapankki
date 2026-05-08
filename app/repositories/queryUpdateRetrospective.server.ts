import { db } from '~/utils/db.server';

export type UpdateRetrospectiveData = {
  participantCount: number;
  summary: string;
  wentWell?: string | null;
  improvements?: string | null;
};

export async function queryUpdateRetrospective(id: string, data: UpdateRetrospectiveData) {
  return db.practiceSessionRetrospective.update({
    where: { id },
    data: {
      participantCount: data.participantCount,
      summary: data.summary,
      wentWell: data.wentWell ?? null,
      improvements: data.improvements ?? null,
    },
  });
}
