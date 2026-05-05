import * as seasonRepo from '~/repositories/season.server';
import type { SeasonFormData } from '~/schemas/season';
import { slugify, makeUniqueSlug } from '~/utils/slugify';

export async function createSeason(input: SeasonFormData) {
  const baseSlug = slugify(input.name);
  const existingSlugs = await seasonRepo.findSeasonsBySlugs([baseSlug]);
  const uniqueSlug = makeUniqueSlug(
    baseSlug,
    existingSlugs.map(s => s.slug)
  );

  return seasonRepo.createSeason({
    slug: uniqueSlug,
    name: input.name,
    description: input.description,
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    endDate: input.endDate ? new Date(input.endDate) : undefined,
    defaultDayOfWeek: input.defaultDayOfWeek,
    defaultStartTime: input.defaultStartTime,
    defaultDurationMin: input.defaultDurationMin,
  });
}

type UpdateSeasonInput = SeasonFormData & {
  id: string;
};

export async function updateSeason(input: UpdateSeasonInput) {
  return seasonRepo.updateSeason(input.id, {
    name: input.name,
    description: input.description,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    defaultDayOfWeek: input.defaultDayOfWeek ?? null,
    defaultStartTime: input.defaultStartTime ?? null,
    defaultDurationMin: input.defaultDurationMin ?? null,
  });
}

export async function deleteSeason(id: string) {
  return seasonRepo.deleteSeason(id);
}

export async function fetchSeasons() {
  return seasonRepo.findAllSeasons();
}

export async function fetchSeasonBySlug(slug: string) {
  return seasonRepo.findSeasonBySlug(slug);
}
