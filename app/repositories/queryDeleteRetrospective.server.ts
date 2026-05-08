import { db } from '~/utils/db.server';

export async function queryDeleteRetrospective(id: string) {
  return db.practiceSessionRetrospective.delete({
    where: { id },
  });
}
