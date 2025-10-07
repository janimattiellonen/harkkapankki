import * as sectionRepo from '~/repositories/section.server';
import type { Section, PractiseLength } from '~/types';

export async function fetchSectionsForPractiseSession(language: string = 'en'): Promise<Section[]> {
  const dbSections = await sectionRepo.findAllSectionsWithDetails(language);

  return dbSections.map(section => {
    // Build duration: either a single number or an object with 60/90 keys
    const durationMap = new Map<number, number>();

    section.durationConfigs.forEach(config => {
      durationMap.set(config.sessionLength, config.duration);
    });

    let duration: number | Record<PractiseLength, number>;

    // Check if we have different durations for 60 and 90
    const duration60 = durationMap.get(60);
    const duration90 = durationMap.get(90);

    if (duration60 !== undefined && duration90 !== undefined && duration60 !== duration90) {
      // Different durations - use object format
      duration = { 60: duration60, 90: duration90 };
    } else if (duration60 !== undefined && duration90 !== undefined && duration60 === duration90) {
      // Same duration for both - use single number
      duration = duration60;
    } else if (duration60 !== undefined) {
      // Only 60 min config - use it for both
      duration = duration60;
    } else if (duration90 !== undefined) {
      // Only 90 min config - use it for both
      duration = duration90;
    } else {
      // No configs at all - default to 0
      duration = 0;
    }

    return {
      id: section.id,
      name: section.name,
      duration,
      items: section.exerciseTypes.map(type => ({
        value: type.id,
        label: type.name,
      })),
    };
  });
}
