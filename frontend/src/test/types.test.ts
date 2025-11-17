/**
 * Tests for TypeScript Types and Constants
 */
import { describe, test, expect } from 'vitest';
import { COMMON_SUBJECTS } from '../types/index';
import type {
  Role,
  BookingStatus,
  SlotRecurrence,
  User,
  Tutor,
  Slot,
  Booking,
} from '../types/index';

describe('Types and Constants', () => {
  test('should export COMMON_SUBJECTS array', () => {
    expect(COMMON_SUBJECTS).toBeInstanceOf(Array);
    expect(COMMON_SUBJECTS.length).toBeGreaterThan(0);
  });

  test('COMMON_SUBJECTS should contain expected subjects', () => {
    expect(COMMON_SUBJECTS).toContain('Math');
    expect(COMMON_SUBJECTS).toContain('Physics');
    expect(COMMON_SUBJECTS).toContain('Chemistry');
    expect(COMMON_SUBJECTS).toContain('Biology');
    expect(COMMON_SUBJECTS).toContain('English');
  });

  test('should validate Role type structure', () => {
    const roles: Role[] = ['STUDENT', 'TUTOR', 'ADMIN'];
    expect(roles).toHaveLength(3);
    expect(roles).toContain('STUDENT');
  });

  test('should validate BookingStatus type structure', () => {
    const statuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    expect(statuses).toHaveLength(4);
    expect(statuses).toContain('CONFIRMED');
  });

  test('should validate SlotRecurrence type structure', () => {
    const recurrences: SlotRecurrence[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'];
    expect(recurrences).toHaveLength(4);
    expect(recurrences).toContain('WEEKLY');
  });

  test('should create valid User object', () => {
    const user: User = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(user.role).toBe('STUDENT');
    expect(user.email).toContain('@');
  });

  test('should create valid Tutor object', () => {
    const tutor: Tutor = {
      id: '123',
      userId: '456',
      bio: 'Expert tutor',
      subjects: ['Math', 'Physics'],
      hourlyRate: 50,
      rating: 4.5,
      totalBookings: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(tutor.subjects).toBeInstanceOf(Array);
    expect(tutor.hourlyRate).toBeGreaterThan(0);
    expect(tutor.rating).toBeGreaterThanOrEqual(0);
  });

  test('should create valid Slot object', () => {
    const slot: Slot = {
      id: '123',
      tutorId: '456',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      isBooked: false,
      recurrence: 'NONE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(slot.isBooked).toBe(false);
    expect(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']).toContain(slot.recurrence);
  });

  test('should create valid Booking object', () => {
    const booking: Booking = {
      id: '123',
      studentId: '456',
      slotId: '789',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).toContain(booking.status);
  });
});
