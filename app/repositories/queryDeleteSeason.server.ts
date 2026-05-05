import { db } from '~/utils/db.server';

export async function queryDeleteSeason(id: string) {
  return db.season.delete({
    where: { id },
  });
}
