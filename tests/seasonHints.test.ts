import { describe, it, expect } from 'vitest';
import { computeSeasonHints } from '~/services/seasonHints.server';

const SECTIONS = [
  {
    id: 'sec-1',
    name: 'Alku',
    eligibleTypeIds: ['type-a', 'type-b'],
  },
  {
    id: 'sec-2',
    name: 'Tekniikka',
    eligibleTypeIds: ['type-c', 'type-d'],
  },
];

function makeSession(
  index: number,
  items: Array<{
    sectionId: string;
    exerciseTypeId: string;
    exerciseId: string | null;
    typeName: string;
    exerciseName: string | null;
  }>
) {
  return {
    id: `session-${index}`,
    slug: `slug-${index}`,
    scheduledAt: null,
    sectionItems: items,
  };
}

describe('computeSeasonHints', () => {
  it('returns no hints when there are no sessions', () => {
    const hints = computeSeasonHints({ sessions: [], sections: SECTIONS });
    expect(hints.staleTypes).toEqual([]);
    expect(hints.recentRepeats).toEqual([]);
    expect(hints.lowDiversitySections).toEqual([]);
  });

  it('does not flag stale types when total sessions <= STALE_WINDOW', () => {
    const sessions = [0, 1, 2].map(i =>
      makeSession(i, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: 'ex-1',
          typeName: 'Alkukäyntö',
          exerciseName: 'Drill 1',
        },
      ])
    );
    const hints = computeSeasonHints({ sessions, sections: SECTIONS });
    expect(hints.staleTypes).toEqual([]);
  });

  it('flags a type that was used once and missed for the last 3 sessions', () => {
    const sessions = [
      makeSession(0, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: 'ex-a',
          typeName: 'A-tyyppi',
          exerciseName: 'A drill',
        },
      ]),
      makeSession(1, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-b',
          exerciseId: 'ex-b',
          typeName: 'B-tyyppi',
          exerciseName: 'B drill',
        },
      ]),
      makeSession(2, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-b',
          exerciseId: 'ex-b2',
          typeName: 'B-tyyppi',
          exerciseName: 'B drill 2',
        },
      ]),
      makeSession(3, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-b',
          exerciseId: 'ex-b3',
          typeName: 'B-tyyppi',
          exerciseName: 'B drill 3',
        },
      ]),
    ];
    const hints = computeSeasonHints({ sessions, sections: SECTIONS });
    expect(hints.staleTypes).toHaveLength(1);
    expect(hints.staleTypes[0]).toMatchObject({
      typeId: 'type-a',
      typeName: 'A-tyyppi',
      sessionsSinceLastUse: 3,
    });
  });

  it('detects a specific exercise repeated within the 2-session window', () => {
    const sessions = [
      makeSession(0, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: 'ex-1',
          typeName: 'A',
          exerciseName: 'Drill 1',
        },
      ]),
      makeSession(1, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: 'ex-1',
          typeName: 'A',
          exerciseName: 'Drill 1',
        },
      ]),
    ];
    const hints = computeSeasonHints({ sessions, sections: SECTIONS });
    expect(hints.recentRepeats).toHaveLength(1);
    expect(hints.recentRepeats[0]).toMatchObject({
      exerciseId: 'ex-1',
      gap: 1,
      earlierSessionSlug: 'slug-0',
      laterSessionSlug: 'slug-1',
    });
  });

  it('does not flag the same exercise reappearing outside the repeat window', () => {
    const sessions = [
      makeSession(0, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: 'ex-1',
          typeName: 'A',
          exerciseName: 'Drill 1',
        },
      ]),
      makeSession(1, []),
      makeSession(2, []),
      makeSession(3, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: 'ex-1',
          typeName: 'A',
          exerciseName: 'Drill 1',
        },
      ]),
    ];
    const hints = computeSeasonHints({ sessions, sections: SECTIONS });
    expect(hints.recentRepeats).toEqual([]);
  });

  it('ignores type-only fallbacks (exerciseId=null) for the repeat rule', () => {
    const sessions = [
      makeSession(0, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: null,
          typeName: 'A',
          exerciseName: null,
        },
      ]),
      makeSession(1, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: null,
          typeName: 'A',
          exerciseName: null,
        },
      ]),
    ];
    const hints = computeSeasonHints({ sessions, sections: SECTIONS });
    expect(hints.recentRepeats).toEqual([]);
  });

  it('flags a section using only one type after enough sessions', () => {
    const sessions = [0, 1, 2, 3].map(i =>
      makeSession(i, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: `ex-${i}`,
          typeName: 'A-tyyppi',
          exerciseName: `Drill ${i}`,
        },
        {
          sectionId: 'sec-2',
          exerciseTypeId: i % 2 === 0 ? 'type-c' : 'type-d',
          exerciseId: `ex-c-${i}`,
          typeName: i % 2 === 0 ? 'C-tyyppi' : 'D-tyyppi',
          exerciseName: `Drill ${i}`,
        },
      ])
    );
    const hints = computeSeasonHints({ sessions, sections: SECTIONS });
    expect(hints.lowDiversitySections).toHaveLength(1);
    expect(hints.lowDiversitySections[0]).toMatchObject({
      sectionId: 'sec-1',
      uniqueTypeName: 'A-tyyppi',
      sessionsInSection: 4,
    });
  });

  it('does not flag low diversity for sections with fewer than 3 sessions', () => {
    const sessions = [0, 1].map(i =>
      makeSession(i, [
        {
          sectionId: 'sec-1',
          exerciseTypeId: 'type-a',
          exerciseId: `ex-${i}`,
          typeName: 'A',
          exerciseName: `Drill ${i}`,
        },
      ])
    );
    const hints = computeSeasonHints({ sessions, sections: SECTIONS });
    expect(hints.lowDiversitySections).toEqual([]);
  });

  it('does not flag low diversity for sections with only one eligible type', () => {
    const sessions = [0, 1, 2, 3].map(i =>
      makeSession(i, [
        {
          sectionId: 'solo',
          exerciseTypeId: 'only',
          exerciseId: `ex-${i}`,
          typeName: 'Only',
          exerciseName: `Drill ${i}`,
        },
      ])
    );
    const hints = computeSeasonHints({
      sessions,
      sections: [{ id: 'solo', name: 'Solo', eligibleTypeIds: ['only'] }],
    });
    expect(hints.lowDiversitySections).toEqual([]);
  });
});
