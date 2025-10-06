import { useState } from "react";
import type { PractiseLength, SelectedItem, Section, SectionItem } from "~/types";
import { PractiseSessionLengthSelector } from "~/components/PractiseSessionLengthSelector";
import { PractiseSessionSection } from "~/components/PractiseSessionSection";
import { PractiseSessionSummary } from "~/components/PractiseSessionSummary";

type PractiseSessionFormProps = {
  sections: Section[];
};

export default function PractiseSessionForm({ sections }: PractiseSessionFormProps) {
  const [practiseLength, setPractiseLength] = useState<PractiseLength>(60);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Get section duration based on practise length
  const getSectionDuration = (section: Section): number => {
    return typeof section.duration === 'number'
      ? section.duration
      : section.duration[practiseLength];
  };

  // Calculate total allocated time
  const calculateTotalTime = (): number => {
    return sections.reduce((total, section) => {
      const hasSelectedItems = selectedItems.some(
        (item) => item.sectionId === section.id
      );
      return hasSelectedItems ? total + getSectionDuration(section) : total;
    }, 0);
  };

  // Get selected items for a specific section
  const getSectionItems = (sectionId: string): SectionItem[] => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return [];

    return selectedItems
      .filter((item) => item.sectionId === sectionId)
      .map((item) => {
        const sectionItem = section.items.find((i) => i.value === item.itemValue);
        return sectionItem!;
      })
      .filter(Boolean);
  };

  // Add item to section
  const handleAddItem = (sectionId: string, item: SectionItem) => {
    setSelectedItems((prev) => [
      ...prev,
      { sectionId, itemValue: item.value },
    ]);
  };

  // Remove item from section
  const handleRemoveItem = (sectionId: string, itemValue: string) => {
    setSelectedItems((prev) =>
      prev.filter(
        (item) => !(item.sectionId === sectionId && item.itemValue === itemValue)
      )
    );
  };

  const totalAllocated = calculateTotalTime();

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Design a Practice Session</h1>

      {/* Length Selector */}
      <PractiseSessionLengthSelector
        selectedLength={practiseLength}
        onLengthChange={setPractiseLength}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sections */}
        <div className="lg:col-span-2 space-y-4">
          {sections.map((section) => (
            <PractiseSessionSection
              key={section.id}
              section={section}
              practiseLength={practiseLength}
              selectedItems={getSectionItems(section.id)}
              onAddItem={(item) => handleAddItem(section.id, item)}
              onRemoveItem={(itemValue) => handleRemoveItem(section.id, itemValue)}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <PractiseSessionSummary
              practiseLength={practiseLength}
              totalAllocated={totalAllocated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
