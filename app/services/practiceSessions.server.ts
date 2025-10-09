import * as practiceSessionRepo from '~/repositories/practiceSession.server';
import type { SelectedItem } from '~/types';
import { slugify, makeUniqueSlug } from '~/utils/slugify';
import { getDefaultLocale } from '~/utils/locale.server';

type CreatePracticeSessionInput = {
  name?: string;
  description?: string;
  sessionLength: number;
  selectedItems: SelectedItem[];
};

export async function createPracticeSession(input: CreatePracticeSessionInput) {
  // Generate slug from name or use default
  const baseName = input.name && input.name.trim() !== '' ? input.name : 'practice-session';
  const baseSlug = slugify(baseName);

  // Check for existing slugs to ensure uniqueness
  const existingSlugs = await practiceSessionRepo.findPracticeSessionsBySlugs([baseSlug]);
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
      order: index + 1,
    }))
  );

  return practiceSessionRepo.createPracticeSession({
    slug: uniqueSlug,
    name: input.name,
    description: input.description,
    sessionLength: input.sessionLength,
    sectionItems,
  });
}

export async function fetchPracticeSessions() {
  return practiceSessionRepo.findAllPracticeSessions();
}

export async function fetchPracticeSessionById(id: string, language: string = getDefaultLocale()) {
  return practiceSessionRepo.findPracticeSessionById(id, language);
}

export async function fetchPracticeSessionBySlug(slug: string, language: string = getDefaultLocale()) {
  return practiceSessionRepo.findPracticeSessionBySlug(slug, language);
}
