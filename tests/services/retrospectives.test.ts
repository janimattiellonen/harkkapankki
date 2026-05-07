import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../setup/db-setup';
import {
  createRetrospective,
  deleteRetrospective,
  fetchRetrospectiveBySessionId,
  updateRetrospective,
} from '~/services/retrospectives.server';

async function createSessionFixture(slug = 'test-session') {
  return db.practiceSession.create({
    data: {
      slug,
      name: 'Test session',
      sessionLength: 90,
    },
  });
}

describe('retrospectives service', () => {
  beforeEach(async () => {
    // The global setup truncates exercise_types CASCADE, which clears
    // dependent rows but not practice_sessions itself. Clear it here so
    // each test starts from a clean slate.
    await db.practiceSessionRetrospective.deleteMany({});
    await db.practiceSession.deleteMany({});
  });

  describe('createRetrospective', () => {
    it('creates a retrospective for a session', async () => {
      const session = await createSessionFixture();

      const created = await createRetrospective(session.id, {
        participantCount: 12,
        summary: 'Worked on putting and approach throws.',
        wentWell: 'Energy was high.',
        improvements: 'Need more variety in warm-up.',
      });

      expect(created.id).toBeTruthy();
      expect(created.practiceSessionId).toBe(session.id);
      expect(created.participantCount).toBe(12);
      expect(created.summary).toBe('Worked on putting and approach throws.');
      expect(created.wentWell).toBe('Energy was high.');
      expect(created.improvements).toBe('Need more variety in warm-up.');
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);

      const inDb = await db.practiceSessionRetrospective.findUnique({
        where: { id: created.id },
      });
      expect(inDb).not.toBeNull();
    });

    it('persists null for omitted optional fields', async () => {
      const session = await createSessionFixture();

      const created = await createRetrospective(session.id, {
        participantCount: 0,
        summary: 'Cancelled, only two showed up.',
      });

      expect(created.wentWell).toBeNull();
      expect(created.improvements).toBeNull();
    });

    it('rejects a second retrospective for the same session (unique constraint)', async () => {
      const session = await createSessionFixture();

      await createRetrospective(session.id, {
        participantCount: 10,
        summary: 'First retro.',
      });

      await expect(
        createRetrospective(session.id, {
          participantCount: 11,
          summary: 'Second attempt — should fail.',
        })
      ).rejects.toThrow();
    });

    it('rejects retrospective for a non-existent session', async () => {
      await expect(
        createRetrospective('00000000-0000-0000-0000-000000000000', {
          participantCount: 5,
          summary: 'Should fail (FK constraint).',
        })
      ).rejects.toThrow();
    });
  });

  describe('updateRetrospective', () => {
    it('updates fields on an existing retrospective', async () => {
      const session = await createSessionFixture();
      const created = await createRetrospective(session.id, {
        participantCount: 8,
        summary: 'Original summary',
        wentWell: 'Original wentWell',
      });

      const updated = await updateRetrospective(created.id, {
        participantCount: 14,
        summary: 'Updated summary',
        wentWell: 'Updated wentWell',
        improvements: 'New improvement notes',
      });

      expect(updated.id).toBe(created.id);
      expect(updated.participantCount).toBe(14);
      expect(updated.summary).toBe('Updated summary');
      expect(updated.wentWell).toBe('Updated wentWell');
      expect(updated.improvements).toBe('New improvement notes');
    });

    it('clears optional fields when undefined is passed', async () => {
      const session = await createSessionFixture();
      const created = await createRetrospective(session.id, {
        participantCount: 8,
        summary: 'Sum',
        wentWell: 'Originally set',
        improvements: 'Originally set',
      });

      const updated = await updateRetrospective(created.id, {
        participantCount: 8,
        summary: 'Sum',
      });

      expect(updated.wentWell).toBeNull();
      expect(updated.improvements).toBeNull();
    });

    it('throws when updating a non-existent retrospective', async () => {
      await expect(
        updateRetrospective('00000000-0000-0000-0000-000000000000', {
          participantCount: 1,
          summary: 'x',
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteRetrospective', () => {
    it('removes a retrospective by id', async () => {
      const session = await createSessionFixture();
      const created = await createRetrospective(session.id, {
        participantCount: 5,
        summary: 'To be deleted',
      });

      await deleteRetrospective(created.id);

      const after = await db.practiceSessionRetrospective.findUnique({
        where: { id: created.id },
      });
      expect(after).toBeNull();
    });

    it('throws when deleting a non-existent retrospective', async () => {
      await expect(
        deleteRetrospective('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow();
    });
  });

  describe('fetchRetrospectiveBySessionId', () => {
    it('returns the retrospective when one exists for the session', async () => {
      const session = await createSessionFixture();
      const created = await createRetrospective(session.id, {
        participantCount: 7,
        summary: 'lookup',
      });

      const fetched = await fetchRetrospectiveBySessionId(session.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
    });

    it('returns null when the session has no retrospective', async () => {
      const session = await createSessionFixture();

      const fetched = await fetchRetrospectiveBySessionId(session.id);
      expect(fetched).toBeNull();
    });
  });

  describe('cascade delete behaviour', () => {
    it('removes the retrospective when its parent session is deleted', async () => {
      const session = await createSessionFixture();
      const created = await createRetrospective(session.id, {
        participantCount: 5,
        summary: 'Should be cascade-deleted.',
      });

      await db.practiceSession.delete({ where: { id: session.id } });

      const after = await db.practiceSessionRetrospective.findUnique({
        where: { id: created.id },
      });
      expect(after).toBeNull();
    });
  });
});
