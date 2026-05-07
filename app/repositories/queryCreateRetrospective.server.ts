import { db } from '~/utils/db.server';

export type CreateRetrospectiveData = {
  practiceSessionId: string;
  participantCount: number;
  summary: string;
  wentWell?: string | null;
  improvements?: string | null;
};

export async function queryCreateRetrospective(data: CreateRetrospectiveData) {
  return db.practiceSessionRetrospective.create({
    data: {
      practiceSessionId: data.practiceSessionId,
      participantCount: data.participantCount,
      summary: data.summary,
      wentWell: data.wentWell ?? null,
      improvements: data.improvements ?? null,
    },
  });
}
