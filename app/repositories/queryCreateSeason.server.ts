import { db } from '~/utils/db.server';

export type CreateSeasonData = {
  slug: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  defaultDayOfWeek?: number;
  defaultStartTime?: string;
  defaultDurationMin?: number;
};

export async function queryCreateSeason(data: CreateSeasonData) {
  return db.season.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      defaultDayOfWeek: data.defaultDayOfWeek ?? null,
      defaultStartTime: data.defaultStartTime ?? null,
      defaultDurationMin: data.defaultDurationMin ?? null,
    },
  });
}
