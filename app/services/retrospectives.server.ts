import { queryCreateRetrospective } from '~/repositories/queryCreateRetrospective.server';
import { queryDeleteRetrospective } from '~/repositories/queryDeleteRetrospective.server';
import { queryRetrospectiveBySessionId } from '~/repositories/queryRetrospectiveBySessionId.server';
import { queryUpdateRetrospective } from '~/repositories/queryUpdateRetrospective.server';

export type RetrospectiveInput = {
  participantCount: number;
  summary: string;
  wentWell?: string;
  improvements?: string;
};

export async function fetchRetrospectiveBySessionId(practiceSessionId: string) {
  return queryRetrospectiveBySessionId(practiceSessionId);
}

export async function createRetrospective(practiceSessionId: string, input: RetrospectiveInput) {
  return queryCreateRetrospective({
    practiceSessionId,
    participantCount: input.participantCount,
    summary: input.summary,
    wentWell: input.wentWell ?? null,
    improvements: input.improvements ?? null,
  });
}

export async function updateRetrospective(id: string, input: RetrospectiveInput) {
  return queryUpdateRetrospective(id, {
    participantCount: input.participantCount,
    summary: input.summary,
    wentWell: input.wentWell ?? null,
    improvements: input.improvements ?? null,
  });
}

export async function deleteRetrospective(id: string) {
  return queryDeleteRetrospective(id);
}
