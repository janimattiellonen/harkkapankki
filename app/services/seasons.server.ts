import { queryCreateSeason } from '~/repositories/queryCreateSeason.server';
import { querySeasons } from '~/repositories/querySeasons.server';
import { querySeasonById } from '~/repositories/querySeasonById.server';
import { querySeasonBySlug } from '~/repositories/querySeasonBySlug.server';
import { querySeasonBySlugWithCoverage } from '~/repositories/querySeasonBySlugWithCoverage.server';
import { queryUpdateSeason } from '~/repositories/queryUpdateSeason.server';
import { queryDeleteSeason } from '~/repositories/queryDeleteSeason.server';
import { querySeasonsBySlugPrefix } from '~/repositories/querySeasonsBySlugPrefix.server';
import { querySectionsWithDetails } from '~/repositories/querySectionsWithDetails.server';
import { queryCreatePracticeSessionTx } from '~/repositories/queryCreatePracticeSessionTx.server';
import { queryPracticeSessionsBySlugPrefix } from '~/repositories/queryPracticeSessionsBySlugPrefix.server';
import { db } from '~/utils/db.server';
import type { SeasonFormData } from '~/schemas/season';
import type { AddSessionsRow } from '~/schemas/addSessions';
import { makeUniqueSlug, slugify } from '~/utils/slugify';
import { helsinkiWallClockToUtc } from '~/utils/timezone';
import {
  generateProgrammeForBatch,
  type GeneratorWarning,
} from '~/services/sessionAutoGenerator.server';
import { computeSeasonHints, type SeasonHints } from '~/services/seasonHints.server';

export async function createSeason(input: SeasonFormData) {
  const baseSlug = slugify(input.name);
  const existingSlugs = await querySeasonsBySlugPrefix(baseSlug);
  const uniqueSlug = makeUniqueSlug(
    baseSlug,
    existingSlugs.map(s => s.slug)
  );

  return queryCreateSeason({
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
  return queryUpdateSeason(input.id, {
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
  return queryDeleteSeason(id);
}

export async function fetchSeasons() {
  return querySeasons();
}

export async function fetchSeasonBySlug(slug: string) {
  return querySeasonBySlug(slug);
}

export async function fetchSeasonById(id: string) {
  return querySeasonById(id);
}

export async function fetchSeasonHints(
  slug: string,
  language: string
): Promise<SeasonHints | null> {
  const [season, sections] = await Promise.all([
    querySeasonBySlugWithCoverage(slug, language),
    querySectionsWithDetails(language),
  ]);
  if (!season) {
    return null;
  }
  return computeSeasonHints({
    sessions: season.practiceSessions.map(session => ({
      id: session.id,
      slug: session.slug,
      scheduledAt: session.scheduledAt,
      sectionItems: session.sectionItems.map(item => ({
        sectionId: item.sectionId,
        exerciseTypeId: item.exerciseTypeId,
        exerciseId: item.exerciseId,
        typeName: item.exerciseType.translations[0]?.name ?? item.exerciseType.slug,
        exerciseName: item.exercise?.name ?? null,
      })),
    })),
    sections: sections.map(section => ({
      id: section.id,
      name: section.name,
      eligibleTypeIds: section.exerciseTypes.map(t => t.id),
    })),
  });
}

type CoverageTypeRow = {
  id: string;
  name: string;
  appearances: number;
  lastSeen: Date | null;
  fallbackOnlyCount: number;
  uniqueExerciseCount: number;
};

type CoverageSectionRow = {
  id: string;
  name: string;
  order: number;
  types: Array<{
    id: string;
    name: string;
    appearances: number;
    lastSeen: Date | null;
  }>;
};

export type SeasonCoverage = {
  season: { slug: string; name: string };
  totalSessions: number;
  perType: CoverageTypeRow[];
  perSection: CoverageSectionRow[];
  hints: SeasonHints;
};

export async function fetchSeasonCoverage(
  slug: string,
  language: string
): Promise<SeasonCoverage | null> {
  const [season, sections] = await Promise.all([
    querySeasonBySlugWithCoverage(slug, language),
    querySectionsWithDetails(language),
  ]);
  if (!season) {
    return null;
  }

  type Aggregate = {
    id: string;
    name: string;
    appearances: number;
    lastSeen: Date | null;
    fallbackOnlyCount: number;
    exerciseIds: Set<string>;
  };

  const perTypeMap = new Map<string, Aggregate>();
  const perSectionTypeMap = new Map<
    string,
    Map<string, { id: string; name: string; appearances: number; lastSeen: Date | null }>
  >();

  for (const section of sections) {
    const inner = new Map<
      string,
      { id: string; name: string; appearances: number; lastSeen: Date | null }
    >();
    for (const type of section.exerciseTypes) {
      inner.set(type.id, { id: type.id, name: type.name, appearances: 0, lastSeen: null });
    }
    perSectionTypeMap.set(section.id, inner);
  }

  for (const session of season.practiceSessions) {
    const sessionDate = session.scheduledAt;
    for (const item of session.sectionItems) {
      const typeName = item.exerciseType.translations[0]?.name ?? item.exerciseType.slug;
      const existing = perTypeMap.get(item.exerciseTypeId);
      if (existing) {
        existing.appearances += 1;
        if (sessionDate && (!existing.lastSeen || sessionDate > existing.lastSeen)) {
          existing.lastSeen = sessionDate;
        }
        if (item.exerciseId === null) {
          existing.fallbackOnlyCount += 1;
        } else {
          existing.exerciseIds.add(item.exerciseId);
        }
      } else {
        perTypeMap.set(item.exerciseTypeId, {
          id: item.exerciseTypeId,
          name: typeName,
          appearances: 1,
          lastSeen: sessionDate,
          fallbackOnlyCount: item.exerciseId === null ? 1 : 0,
          exerciseIds: new Set(item.exerciseId === null ? [] : [item.exerciseId]),
        });
      }

      const sectionRow = perSectionTypeMap.get(item.sectionId);
      if (sectionRow) {
        const typeRow = sectionRow.get(item.exerciseTypeId);
        if (typeRow) {
          typeRow.appearances += 1;
          if (sessionDate && (!typeRow.lastSeen || sessionDate > typeRow.lastSeen)) {
            typeRow.lastSeen = sessionDate;
          }
        }
      }
    }
  }

  for (const section of sections) {
    for (const type of section.exerciseTypes) {
      if (!perTypeMap.has(type.id)) {
        perTypeMap.set(type.id, {
          id: type.id,
          name: type.name,
          appearances: 0,
          lastSeen: null,
          fallbackOnlyCount: 0,
          exerciseIds: new Set<string>(),
        });
      }
    }
  }

  const perType: CoverageTypeRow[] = Array.from(perTypeMap.values())
    .map(t => ({
      id: t.id,
      name: t.name,
      appearances: t.appearances,
      lastSeen: t.lastSeen,
      fallbackOnlyCount: t.fallbackOnlyCount,
      uniqueExerciseCount: t.exerciseIds.size,
    }))
    .sort((a, b) => {
      if (a.appearances !== b.appearances) {
        return b.appearances - a.appearances;
      }
      return a.name.localeCompare(b.name);
    });

  const perSection: CoverageSectionRow[] = sections
    .map(section => {
      const inner = perSectionTypeMap.get(section.id);
      const types = inner
        ? Array.from(inner.values()).sort((a, b) => {
            if (a.appearances !== b.appearances) {
              return b.appearances - a.appearances;
            }
            return a.name.localeCompare(b.name);
          })
        : [];
      return { id: section.id, name: section.name, order: section.order, types };
    })
    .sort((a, b) => a.order - b.order);

  const hintsInput = {
    sessions: season.practiceSessions.map(session => ({
      id: session.id,
      slug: session.slug,
      scheduledAt: session.scheduledAt,
      sectionItems: session.sectionItems.map(item => ({
        sectionId: item.sectionId,
        exerciseTypeId: item.exerciseTypeId,
        exerciseId: item.exerciseId,
        typeName: item.exerciseType.translations[0]?.name ?? item.exerciseType.slug,
        exerciseName: item.exercise?.name ?? null,
      })),
    })),
    sections: sections.map(section => ({
      id: section.id,
      name: section.name,
      eligibleTypeIds: section.exerciseTypes.map(t => t.id),
    })),
  };
  const hints = computeSeasonHints(hintsInput);

  return {
    season: { slug: season.slug, name: season.name },
    totalSessions: season.practiceSessions.length,
    perType,
    perSection,
    hints,
  };
}

type SectionsWithDetails = Awaited<ReturnType<typeof querySectionsWithDetails>>;

export async function fetchAddSessionsContext(slug: string, language: string) {
  const [season, sections] = await Promise.all([
    querySeasonBySlug(slug),
    querySectionsWithDetails(language),
  ]);
  if (!season) {
    return null;
  }
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
  existingSessionCount: number;
};

const DEFAULT_SESSION_NAME_PREFIX = 'Kenttätreenit';

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
  const existing = await queryPracticeSessionsBySlugPrefix(baseSlug);
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
      const sessionNumber = input.existingSessionCount + i + 1;
      await queryCreatePracticeSessionTx(tx, {
        slug: finalSlugs[i],
        name: `${DEFAULT_SESSION_NAME_PREFIX} #${sessionNumber}`,
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
