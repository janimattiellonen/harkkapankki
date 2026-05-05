import * as seasonRepo from '~/repositories/season.server';
import * as sectionRepo from '~/repositories/section.server';
import {
  createPracticeSessionTx,
  findPracticeSessionsBySlugPrefix,
} from '~/repositories/practiceSession.server';
import { db } from '~/utils/db.server';
import type { SeasonFormData } from '~/schemas/season';
import type { AddSessionsRow } from '~/schemas/addSessions';
import { makeUniqueSlug, slugify } from '~/utils/slugify';
import { helsinkiWallClockToUtc } from '~/utils/timezone';
import {
  generateProgrammeForBatch,
  type GeneratorWarning,
} from '~/services/sessionAutoGenerator.server';

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

type SectionsWithDetails = Awaited<ReturnType<typeof sectionRepo.findAllSectionsWithDetails>>;

export async function fetchAddSessionsContext(slug: string, language: string) {
  const [season, sections] = await Promise.all([
    seasonRepo.findSeasonBySlug(slug),
    sectionRepo.findAllSectionsWithDetails(language),
  ]);
  if (!season) return null;
  return { season, sections };
}

type DiffMinutesArgs = { startTime: string; endTime: string };
function diffMinutes({ startTime, endTime }: DiffMinutesArgs): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

type CreateSessionsForSeasonInput = {
  season: { id: string; slug: string };
  sections: SectionsWithDetails;
  rows: AddSessionsRow[];
};

export async function createSessionsForSeason(input: CreateSessionsForSeasonInput): Promise<{
  createdCount: number;
  warnings: GeneratorWarning[];
}> {
  const generatorSections = input.sections.map(section => ({
    id: section.id,
    order: section.order,
    eligibleTypes: section.exerciseTypes.map(t => ({
      id: t.id,
      exerciseIds: t.exercises.map(e => e.id),
    })),
  }));

  const programme = generateProgrammeForBatch({
    sections: generatorSections,
    rowCount: input.rows.length,
  });

  const baseSlug = input.season.slug;
  const proposedSlugs = input.rows.map(row => `${baseSlug}-${row.date}`);
  const existing = await findPracticeSessionsBySlugPrefix(baseSlug);
  const taken = new Set(existing.map(e => e.slug));

  const finalSlugs: string[] = [];
  for (const proposed of proposedSlugs) {
    const unique = makeUniqueSlug(proposed, [...taken, ...finalSlugs]);
    finalSlugs.push(unique);
  }

  await db.$transaction(async tx => {
    for (let i = 0; i < input.rows.length; i++) {
      const row = input.rows[i];
      const scheduledAt = helsinkiWallClockToUtc(row.date, row.startTime);
      const sessionLength = diffMinutes(row);
      await createPracticeSessionTx(tx, {
        slug: finalSlugs[i],
        sessionLength,
        seasonId: input.season.id,
        scheduledAt,
        sectionItems: programme.sessions[i].items,
      });
    }
  });

  return {
    createdCount: input.rows.length,
    warnings: programme.warnings,
  };
}
