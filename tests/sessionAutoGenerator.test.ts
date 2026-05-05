import { describe, it, expect } from 'vitest';
import { generateProgrammeForBatch } from '~/services/sessionAutoGenerator.server';

function seededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return state / 0x100000000;
  };
}

const fiveSections = [
  {
    id: 'sec-1',
    order: 1,
    eligibleTypes: [{ id: 'type-1', exerciseIds: ['ex-1a', 'ex-1b', 'ex-1c'] }],
  },
  {
    id: 'sec-2',
    order: 2,
    eligibleTypes: [{ id: 'type-2', exerciseIds: ['ex-2a', 'ex-2b', 'ex-2c'] }],
  },
  {
    id: 'sec-3',
    order: 3,
    eligibleTypes: [{ id: 'type-3', exerciseIds: ['ex-3a', 'ex-3b', 'ex-3c'] }],
  },
  {
    id: 'sec-4',
    order: 4,
    eligibleTypes: [{ id: 'type-4', exerciseIds: ['ex-4a', 'ex-4b', 'ex-4c'] }],
  },
  {
    id: 'sec-5',
    order: 5,
    eligibleTypes: [{ id: 'type-5', exerciseIds: ['ex-5a', 'ex-5b', 'ex-5c'] }],
  },
];

describe('generateProgrammeForBatch', () => {
  it('produces one item per section per row', () => {
    const result = generateProgrammeForBatch({
      sections: fiveSections,
      rowCount: 3,
      rng: seededRng(1),
    });

    expect(result.sessions).toHaveLength(3);
    for (const session of result.sessions) {
      expect(session.items).toHaveLength(5);
      const sectionsCovered = session.items.map(i => i.sectionId).sort();
      expect(sectionsCovered).toEqual(['sec-1', 'sec-2', 'sec-3', 'sec-4', 'sec-5']);
    }
    expect(result.warnings).toEqual([]);
  });

  it('respects the rolling 2-row exclusion window per section', () => {
    const result = generateProgrammeForBatch({
      sections: fiveSections,
      rowCount: 3,
      rng: seededRng(42),
    });

    for (let row = 1; row < 3; row++) {
      const previousRow = result.sessions[row - 1];
      for (const item of result.sessions[row].items) {
        const previousAtSameSection = previousRow.items.find(p => p.sectionId === item.sectionId);
        if (previousAtSameSection?.exerciseId && item.exerciseId) {
          expect(item.exerciseId).not.toBe(previousAtSameSection.exerciseId);
        }
      }
    }
  });

  it('falls back to type-only when no fresh drill is available', () => {
    const sparseSection = {
      id: 'sec-1',
      order: 1,
      eligibleTypes: [{ id: 'type-1', exerciseIds: ['only-one'] }],
    };

    const result = generateProgrammeForBatch({
      sections: [sparseSection],
      rowCount: 3,
      rng: seededRng(7),
    });

    expect(result.sessions[0].items[0].exerciseId).toBe('only-one');
    expect(result.sessions[1].items[0].exerciseId).toBe(null);
    expect(result.warnings).toContainEqual({
      rowIndex: 1,
      sectionId: 'sec-1',
      reason: 'no-fresh-drill',
    });
  });

  it('emits a no-eligible-types warning and skips items when section has no types', () => {
    const result = generateProgrammeForBatch({
      sections: [
        { id: 'sec-empty', order: 1, eligibleTypes: [] },
        { id: 'sec-ok', order: 2, eligibleTypes: [{ id: 't', exerciseIds: ['x'] }] },
      ],
      rowCount: 1,
      rng: seededRng(3),
    });

    expect(result.sessions[0].items).toHaveLength(1);
    expect(result.sessions[0].items[0].sectionId).toBe('sec-ok');
    expect(result.warnings).toContainEqual({
      rowIndex: 0,
      sectionId: 'sec-empty',
      reason: 'no-eligible-types',
    });
  });

  it('is deterministic under the same seed', () => {
    const a = generateProgrammeForBatch({
      sections: fiveSections,
      rowCount: 4,
      rng: seededRng(123),
    });
    const b = generateProgrammeForBatch({
      sections: fiveSections,
      rowCount: 4,
      rng: seededRng(123),
    });
    expect(a).toEqual(b);
  });

  it('handles rowCount of 0', () => {
    const result = generateProgrammeForBatch({
      sections: fiveSections,
      rowCount: 0,
      rng: seededRng(1),
    });
    expect(result.sessions).toEqual([]);
    expect(result.warnings).toEqual([]);
  });
});
