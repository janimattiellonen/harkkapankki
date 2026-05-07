import { describe, it, expect } from 'vitest';
import { retrospectiveSchema, retrospectiveFormSchema } from '~/schemas/retrospective';

describe('retrospectiveSchema (server-side, transforming)', () => {
  it('parses valid input and transforms participantCount to a number', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '12',
      summary: 'We worked on putting and threw a few rounds.',
      wentWell: 'Energy was high.',
      improvements: 'Need more variety in warm-up.',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.participantCount).toBe(12);
    expect(typeof result.data.participantCount).toBe('number');
    expect(result.data.summary).toBe('We worked on putting and threw a few rounds.');
    expect(result.data.wentWell).toBe('Energy was high.');
    expect(result.data.improvements).toBe('Need more variety in warm-up.');
  });

  it('accepts participantCount = 0 (rained out / no-show)', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '0',
      summary: 'Cancelled due to thunderstorm.',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.participantCount).toBe(0);
  });

  it('accepts participantCount = 100 (upper bound)', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '100',
      summary: 'Big tournament practice.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects participantCount above 100', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '101',
      summary: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative participantCount', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '-1',
      summary: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer participantCount', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '12.5',
      summary: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric participantCount', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: 'twelve',
      summary: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty participantCount', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '',
      summary: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty summary', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '5',
      summary: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only summary', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '5',
      summary: '   \n  ',
    });
    expect(result.success).toBe(false);
  });

  it('trims surrounding whitespace from summary', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '5',
      summary: '   Worked on putting.   ',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.summary).toBe('Worked on putting.');
  });

  it('treats empty wentWell as undefined', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '5',
      summary: 'Did the thing.',
      wentWell: '',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.wentWell).toBeUndefined();
  });

  it('treats whitespace-only improvements as undefined', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '5',
      summary: 'Did the thing.',
      improvements: '   ',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.improvements).toBeUndefined();
  });

  it('omits wentWell and improvements when not provided', () => {
    const result = retrospectiveSchema.safeParse({
      participantCount: '5',
      summary: 'Did the thing.',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.wentWell).toBeUndefined();
    expect(result.data.improvements).toBeUndefined();
  });
});

describe('retrospectiveFormSchema (client-side, no transforms)', () => {
  it('accepts valid string inputs without transforming participantCount', () => {
    const result = retrospectiveFormSchema.safeParse({
      participantCount: '14',
      summary: 'Did stuff.',
      wentWell: '',
      improvements: '',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.participantCount).toBe('14');
    expect(typeof result.data.participantCount).toBe('string');
  });

  it('rejects out-of-range participantCount', () => {
    const result = retrospectiveFormSchema.safeParse({
      participantCount: '500',
      summary: 'Anything',
    });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only summary', () => {
    const result = retrospectiveFormSchema.safeParse({
      participantCount: '5',
      summary: '   ',
    });
    expect(result.success).toBe(false);
  });
});
