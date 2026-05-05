import { queryCreatePracticeSession } from '~/repositories/queryCreatePracticeSession.server';
import { queryPracticeSessions } from '~/repositories/queryPracticeSessions.server';
import { queryPracticeSessionById } from '~/repositories/queryPracticeSessionById.server';
import { queryPracticeSessionBySlug } from '~/repositories/queryPracticeSessionBySlug.server';
import { queryPracticeSessionsBySlugPrefix } from '~/repositories/queryPracticeSessionsBySlugPrefix.server';
import { queryUpdatePracticeSession } from '~/repositories/queryUpdatePracticeSession.server';
import { queryDeletePracticeSession } from '~/repositories/queryDeletePracticeSession.server';
import type { SelectedItem } from '~/types';
import { slugify, makeUniqueSlug } from '~/utils/slugify';
import { getDefaultLocale } from '~/utils/locale.server';

type CreatePracticeSessionInput = {
  name?: string;
  description?: string;
  sessionLength: number;
  seasonId?: string | null;
  scheduledAt?: Date | null;
  selectedItems: SelectedItem[];
};

export async function createPracticeSession(input: CreatePracticeSessionInput) {
  // Generate slug from name or use default
  const baseName = input.name && input.name.trim() !== '' ? input.name : 'practice-session';
  const baseSlug = slugify(baseName);

  // Check for existing slugs to ensure uniqueness
  const existingSlugs = await queryPracticeSessionsBySlugPrefix(baseSlug);
  const existingSlugStrings = existingSlugs.map(s => s.slug);
  const uniqueSlug = makeUniqueSlug(baseSlug, existingSlugStrings);

  // Transform selectedItems into the format needed for the repository
  // Group items by section to maintain order
  const itemsBySection = input.selectedItems.reduce(
    (acc, item) => {
      if (!acc[item.sectionId]) {
        acc[item.sectionId] = [];
      }
      acc[item.sectionId].push(item);
      return acc;
    },
    {} as Record<string, SelectedItem[]>
  );

  // Create section items with order
  const sectionItems = Object.entries(itemsBySection).flatMap(([sectionId, items]) =>
    items.map((item, index) => ({
      sectionId,
      exerciseTypeId: item.itemValue,
      exerciseId: item.exerciseId || null,
      order: index + 1,
    }))
  );

  return queryCreatePracticeSession({
    slug: uniqueSlug,
    name: input.name,
    description: input.description,
    sessionLength: input.sessionLength,
    seasonId: input.seasonId ?? null,
    scheduledAt: input.scheduledAt ?? null,
    sectionItems,
  });
}

type UpdatePracticeSessionInput = {
  id: string;
  name?: string;
  description?: string;
  sessionLength: number;
  scheduledAt?: Date | null;
  selectedItems: SelectedItem[];
};

export async function updatePracticeSession(input: UpdatePracticeSessionInput) {
  const itemsBySection = input.selectedItems.reduce(
    (acc, item) => {
      if (!acc[item.sectionId]) {
        acc[item.sectionId] = [];
      }
      acc[item.sectionId].push(item);
      return acc;
    },
    {} as Record<string, SelectedItem[]>
  );

  const sectionItems = Object.entries(itemsBySection).flatMap(([sectionId, items]) =>
    items.map((item, index) => ({
      sectionId,
      exerciseTypeId: item.itemValue,
      exerciseId: item.exerciseId || null,
      order: index + 1,
    }))
  );

  return queryUpdatePracticeSession(input.id, {
    name: input.name,
    description: input.description,
    sessionLength: input.sessionLength,
    scheduledAt: input.scheduledAt ?? null,
    sectionItems,
  });
}

export async function deletePracticeSession(id: string) {
  return queryDeletePracticeSession(id);
}

type FetchPracticeSessionsOptions = {
  standaloneOnly?: boolean;
};

export async function fetchPracticeSessions(options: FetchPracticeSessionsOptions = {}) {
  return queryPracticeSessions({
    standaloneOnly: options.standaloneOnly,
  });
}

export async function fetchPracticeSessionById(id: string, language: string = getDefaultLocale()) {
  return queryPracticeSessionById(id, language);
}

export async function fetchPracticeSessionBySlug(
  slug: string,
  language: string = getDefaultLocale()
) {
  return queryPracticeSessionBySlug(slug, language);
}
