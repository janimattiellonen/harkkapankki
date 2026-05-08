import { db } from '~/utils/db.server';

export async function queryRetrospectiveBySessionId(practiceSessionId: string) {
  return db.practiceSessionRetrospective.findUnique({
    where: { practiceSessionId },
  });
}
