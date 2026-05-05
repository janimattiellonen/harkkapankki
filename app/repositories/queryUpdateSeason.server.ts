import { db } from '~/utils/db.server';

export type UpdateSeasonData = {
  name: string;
  description?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  defaultDayOfWeek?: number | null;
  defaultStartTime?: string | null;
  defaultDurationMin?: number | null;
};

export async function queryUpdateSeason(id: string, data: UpdateSeasonData) {
  return db.season.update({
    where: { id },
    data: {
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
