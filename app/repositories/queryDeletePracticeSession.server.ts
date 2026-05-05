import { db } from '~/utils/db.server';

export async function queryDeletePracticeSession(id: string) {
  return db.practiceSession.delete({
    where: { id },
  });
}
