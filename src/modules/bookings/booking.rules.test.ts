import { describe, expect, it } from 'vitest';

import { isWithinWorkingHours } from './booking.rules.js';

const mondaySchedule = { startTime: '09:00', endTime: '18:00' };

describe('isWithinWorkingHours', () => {
  it('accepts a booking entirely inside the working schedule', () => {
    const startAt = new Date('2026-07-20T10:00:00.000Z');
    const endAt = new Date('2026-07-20T10:45:00.000Z');

    expect(isWithinWorkingHours(startAt, endAt, mondaySchedule)).toBe(true);
  });

  it('rejects a booking that starts before the working schedule', () => {
    const startAt = new Date('2026-07-20T08:45:00.000Z');
    const endAt = new Date('2026-07-20T09:30:00.000Z');

    expect(isWithinWorkingHours(startAt, endAt, mondaySchedule)).toBe(false);
  });

  it('rejects a booking that ends after the working schedule', () => {
    const startAt = new Date('2026-07-20T17:30:00.000Z');
    const endAt = new Date('2026-07-20T18:15:00.000Z');

    expect(isWithinWorkingHours(startAt, endAt, mondaySchedule)).toBe(false);
  });

  it('rejects a booking that crosses midnight', () => {
    const startAt = new Date('2026-07-20T23:30:00.000Z');
    const endAt = new Date('2026-07-21T00:15:00.000Z');

    expect(isWithinWorkingHours(startAt, endAt, mondaySchedule)).toBe(false);
  });
});
