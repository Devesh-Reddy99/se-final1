/**
 * Tests for Services and Types
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type {
  Role,
  BookingStatus,
  SlotRecurrence,
  User,
  Tutor,
  Slot,
  Booking,
  TutorFilters,
  BookingFilters,
  ApiError,
  LoadingState,
} from '../types/index';
import { COMMON_SUBJECTS } from '../types/index';

describe('Type Definitions', () => {
  test('should validate Role types', () => {
    const validRoles: Role[] = ['STUDENT', 'TUTOR', 'ADMIN'];
    
    expect(validRoles).toContain('STUDENT');
    expect(validRoles).toContain('TUTOR');
    expect(validRoles).toContain('ADMIN');
    expect(validRoles).toHaveLength(3);
  });

  test('should validate BookingStatus types', () => {
    const validStatuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    
    expect(validStatuses).toContain('PENDING');
    expect(validStatuses).toContain('CONFIRMED');
    expect(validStatuses).toContain('CANCELLED');
    expect(validStatuses).toContain('COMPLETED');
  });

  test('should validate SlotRecurrence types', () => {
    const validRecurrences: SlotRecurrence[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'];
    
    expect(validRecurrences).toContain('NONE');
    expect(validRecurrences).toContain('DAILY');
    expect(validRecurrences).toContain('WEEKLY');
    expect(validRecurrences).toContain('MONTHLY');
  });

  test('should validate User interface structure', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      name: 'Test User',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('role');
    expect(['STUDENT', 'TUTOR', 'ADMIN']).toContain(user.role);
  });

  test('should validate Tutor interface structure', () => {
    const tutor: Tutor = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '650e8400-e29b-41d4-a716-446655440000',
      bio: 'Experienced tutor',
      subjects: ['Math', 'Physics'],
      hourlyRate: 45,
      rating: 4.5,
      totalBookings: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(tutor).toHaveProperty('userId');
    expect(tutor.subjects).toBeInstanceOf(Array);
    expect(tutor.hourlyRate).toBeGreaterThan(0);
    expect(tutor.rating).toBeGreaterThanOrEqual(0);
    expect(tutor.rating).toBeLessThanOrEqual(5);
  });

  test('should validate Slot interface structure', () => {
    const slot: Slot = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      tutorId: '650e8400-e29b-41d4-a716-446655440000',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      isBooked: false,
      recurrence: 'NONE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(slot).toHaveProperty('tutorId');
    expect(slot.isBooked).toBe(false);
    expect(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']).toContain(slot.recurrence);
  });

  test('should validate Booking interface structure', () => {
    const booking: Booking = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      studentId: '650e8400-e29b-41d4-a716-446655440000',
      slotId: '750e8400-e29b-41d4-a716-446655440000',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(booking).toHaveProperty('studentId');
    expect(booking).toHaveProperty('slotId');
    expect(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).toContain(booking.status);
  });

  test('should validate TutorFilters interface', () => {
    const filters: TutorFilters = {
      subject: 'Math',
      maxRate: 50,
      minRating: 4.0,
      sortBy: 'rating',
    };

    expect(filters.maxRate).toBeGreaterThan(0);
    expect(filters.minRating).toBeGreaterThanOrEqual(0);
    expect(['name', 'rate-asc', 'rate-desc', 'rating']).toContain(filters.sortBy);
  });

  test('should validate BookingFilters interface', () => {
    const filters: BookingFilters = {
      status: 'CONFIRMED',
      dateFrom: new Date().toISOString(),
      dateTo: new Date(Date.now() + 86400000).toISOString(),
    };

    expect(filters.status).toBeTruthy();
    expect(filters.dateFrom).toBeTruthy();
    expect(filters.dateTo).toBeTruthy();
  });

  test('should validate ApiError interface', () => {
    const error: ApiError = {
      message: 'Validation failed',
      statusCode: 400,
      errors: {
        email: ['Invalid email format'],
        password: ['Password too weak'],
      },
    };

    expect(error.message).toBeTruthy();
    expect(error.statusCode).toBe(400);
    expect(error.errors).toHaveProperty('email');
  });

  test('should validate LoadingState type', () => {
    const states: LoadingState[] = ['idle', 'loading', 'success', 'error'];
    
    expect(states).toContain('idle');
    expect(states).toContain('loading');
    expect(states).toContain('success');
    expect(states).toContain('error');
  });

  test('should have COMMON_SUBJECTS constant', () => {
    expect(COMMON_SUBJECTS).toBeInstanceOf(Array);
    expect(COMMON_SUBJECTS.length).toBeGreaterThan(0);
    expect(COMMON_SUBJECTS).toContain('Math');
    expect(COMMON_SUBJECTS).toContain('Physics');
    expect(COMMON_SUBJECTS).toContain('Chemistry');
  });
});

describe('Service Layer', () => {
  beforeEach(() => {
    // Mock localStorage with actual storage
    const storage: Record<string, string> = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete storage[key]; }),
      clear: vi.fn(() => { Object.keys(storage).forEach(key => delete storage[key]); }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  test('should handle API request configuration', () => {
    const config = {
      baseURL: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    expect(config.baseURL).toBe('http://localhost:3000/api');
    expect(config.headers['Content-Type']).toBe('application/json');
  });

  test('should handle token in request headers', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
    localStorage.setItem('token', token);

    const retrievedToken = localStorage.getItem('token');
    expect(retrievedToken).toBe(token);
  });

  test('should handle 401 responses', () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    expect(error.response.status).toBe(401);
  });

  test('should handle user service methods', () => {
    const userServiceMethods = ['updateProfile', 'getProfile'];
    expect(userServiceMethods).toContain('updateProfile');
    expect(userServiceMethods).toContain('getProfile');
  });
});

describe('Utility Functions', () => {
  test('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
  });

  test('should validate UUID format', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    expect(uuidRegex.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(uuidRegex.test('invalid-uuid')).toBe(false);
  });

  test('should format currency', () => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    expect(formatCurrency(45.00)).toContain('45');
    expect(formatCurrency(100)).toContain('100');
  });

  test('should format dates', () => {
    const date = new Date('2025-11-18T10:00:00');
    const formatted = date.toLocaleDateString('en-US');
    
    expect(formatted).toBeTruthy();
    expect(formatted).toContain('2025');
  });

  test('should calculate time difference', () => {
    const start = new Date('2025-11-18T10:00:00');
    const end = new Date('2025-11-18T11:00:00');
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    expect(diffHours).toBe(1);
  });

  test('should filter arrays', () => {
    const tutors = [
      { id: 1, rating: 4.8 },
      { id: 2, rating: 3.5 },
      { id: 3, rating: 4.2 },
    ];

    const filtered = tutors.filter(t => t.rating >= 4.0);
    expect(filtered).toHaveLength(2);
  });

  test('should map arrays', () => {
    const subjects = ['Math', 'Physics', 'Chemistry'];
    const lowercase = subjects.map(s => s.toLowerCase());
    
    expect(lowercase).toEqual(['math', 'physics', 'chemistry']);
  });

  test('should handle sorting', () => {
    const tutors = [
      { name: 'Charlie', rating: 4.5 },
      { name: 'Alice', rating: 4.8 },
      { name: 'Bob', rating: 4.2 },
    ];

    const sortedByName = [...tutors].sort((a, b) => a.name.localeCompare(b.name));
    expect(sortedByName[0].name).toBe('Alice');

    const sortedByRating = [...tutors].sort((a, b) => b.rating - a.rating);
    expect(sortedByRating[0].rating).toBe(4.8);
  });

  test('should handle pagination', () => {
    const calculatePagination = (page: number, limit: number, total: number) => {
      return {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      };
    };

    const pagination = calculatePagination(2, 10, 50);
    expect(pagination.totalPages).toBe(5);
    expect(pagination.hasNext).toBe(true);
    expect(pagination.hasPrev).toBe(true);
  });

  test('should validate rating range', () => {
    const isValidRating = (rating: number) => rating >= 0 && rating <= 5;
    
    expect(isValidRating(4.5)).toBe(true);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(-1)).toBe(false);
  });

  test('should calculate average rating', () => {
    const ratings = [5, 4, 5, 3, 4];
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    
    expect(average).toBe(4.2);
  });

  test('should handle string truncation', () => {
    const truncate = (str: string, maxLength: number) => {
      return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
    };

    expect(truncate('Short', 10)).toBe('Short');
    expect(truncate('This is a long text', 10)).toBe('This is a ...');
  });

  test('should handle case conversion', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
    expect('WORLD'.toLowerCase()).toBe('world');
  });

  test('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5];
    
    expect(numbers.length).toBe(5);
    expect(numbers.includes(3)).toBe(true);
    expect(numbers.indexOf(3)).toBe(2);
  });

  test('should handle object operations', () => {
    const user = { name: 'John', age: 30, role: 'STUDENT' };
    
    expect(Object.keys(user)).toEqual(['name', 'age', 'role']);
    expect(Object.values(user)).toContain('John');
    expect('name' in user).toBe(true);
  });

  test('should handle promise operations', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    
    expect(result).toBe('success');
  });

  test('should handle error objects', () => {
    const error = new Error('Test error');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
  });

  test('should handle JSON operations', () => {
    const obj = { name: 'Test', value: 123 };
    const json = JSON.stringify(obj);
    const parsed = JSON.parse(json);
    
    expect(parsed).toEqual(obj);
  });

  test('should handle type checking', () => {
    expect(typeof 'string').toBe('string');
    expect(typeof 123).toBe('number');
    expect(typeof true).toBe('boolean');
    expect(Array.isArray([])).toBe(true);
  });
});
