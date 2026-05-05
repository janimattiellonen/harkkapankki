import { db } from '~/utils/db.server';

type CreateSeasonData = {
  slug: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  defaultDayOfWeek?: number;
  defaultStartTime?: string;
  defaultDurationMin?: number;
};

type UpdateSeasonData = {
  name: string;
  description?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  defaultDayOfWeek?: number | null;
  defaultStartTime?: string | null;
  defaultDurationMin?: number | null;
};

export async function createSeason(data: CreateSeasonData) {
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

export async function findAllSeasons() {
  return db.season.findMany({
    orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          practiceSessions: true,
        },
      },
    },
  });
}

export async function findSeasonBySlug(slug: string) {
  return db.season.findUnique({
    where: { slug },
    include: {
      practiceSessions: {
        orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          slug: true,
          name: true,
          scheduledAt: true,
          sessionLength: true,
        },
      },
    },
  });
}

export async function updateSeason(id: string, data: UpdateSeasonData) {
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

export async function deleteSeason(id: string) {
  return db.season.delete({
    where: { id },
  });
}

export async function findSeasonsBySlugs(slugs: string[]) {
  return db.season.findMany({
    where: {
      slug: {
        in: slugs,
      },
    },
    select: {
      slug: true,
    },
  });
}
