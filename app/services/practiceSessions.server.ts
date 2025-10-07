import * as practiceSessionRepo from "~/repositories/practiceSession.server";
import type { SelectedItem } from "~/types";

type CreatePracticeSessionInput = {
  name?: string;
  description?: string;
  sessionLength: number;
  selectedItems: SelectedItem[];
};

export async function createPracticeSession(input: CreatePracticeSessionInput) {
  // Transform selectedItems into the format needed for the repository
  // Group items by section to maintain order
  const itemsBySection = input.selectedItems.reduce((acc, item) => {
    if (!acc[item.sectionId]) {
      acc[item.sectionId] = [];
    }
    acc[item.sectionId].push(item);
    return acc;
  }, {} as Record<string, SelectedItem[]>);

  // Create section items with order
  const sectionItems = Object.entries(itemsBySection).flatMap(([sectionId, items]) =>
    items.map((item, index) => ({
      sectionId,
      exerciseTypeId: item.itemValue,
      order: index + 1,
    }))
  );

  return practiceSessionRepo.createPracticeSession({
    name: input.name,
    description: input.description,
    sessionLength: input.sessionLength,
    sectionItems,
  });
}

export async function fetchPracticeSessions() {
  return practiceSessionRepo.findAllPracticeSessions();
}
