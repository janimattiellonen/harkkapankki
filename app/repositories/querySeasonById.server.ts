import { db } from '~/utils/db.server';

export async function querySeasonById(id: string) {
  return db.season.findUnique({
    where: { id },
    select: { id: true, slug: true, name: true },
  });
}
