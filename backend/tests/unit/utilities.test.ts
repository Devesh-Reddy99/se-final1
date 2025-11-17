/**
 * Unit Tests for Utility Functions
 */
import { asyncHandler } from '../../src/utils/asyncHandler';
import { Request, Response, NextFunction } from 'express';

describe('AsyncHandler Utility', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  test('should handle successful async operations', async () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(asyncFn);

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should catch and pass errors to next middleware', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const handler = asyncHandler(asyncFn);

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  test('should handle synchronous errors', async () => {
    const error = new Error('Sync error');
    const asyncFn = jest.fn().mockImplementation(() => {
      return Promise.reject(error);
    });
    const handler = asyncHandler(asyncFn);

    await handler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

describe('Validation Helpers', () => {
  test('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('user.name@example.co.uk')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('@example.com')).toBe(false);
    expect(emailRegex.test('user@')).toBe(false);
  });

  test('should validate password strength', () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    expect(passwordRegex.test('StrongPass123!')).toBe(true);
    expect(passwordRegex.test('Admin@123')).toBe(true);
    expect(passwordRegex.test('weakpass')).toBe(false);
    expect(passwordRegex.test('NoNumber!')).toBe(false);
    expect(passwordRegex.test('nospecial123')).toBe(false);
  });

  test('should validate UUID format', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    expect(uuidRegex.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(uuidRegex.test('invalid-uuid')).toBe(false);
    expect(uuidRegex.test('123')).toBe(false);
  });

  test('should validate date format', () => {
    const isValidDate = (dateString: string) => {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime());
    };

    expect(isValidDate('2025-11-18T10:00:00Z')).toBe(true);
    expect(isValidDate('2025-11-18')).toBe(true);
    expect(isValidDate('invalid-date')).toBe(false);
  });
});

describe('String Utilities', () => {
  test('should trim whitespace', () => {
    expect('  hello  '.trim()).toBe('hello');
    expect('test'.trim()).toBe('test');
  });

  test('should convert to lowercase', () => {
    expect('HELLO'.toLowerCase()).toBe('hello');
    expect('MixedCase'.toLowerCase()).toBe('mixedcase');
  });

  test('should split strings', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
    expect('hello world'.split(' ')).toEqual(['hello', 'world']);
  });

  test('should check string inclusion', () => {
    expect('hello world'.includes('world')).toBe(true);
    expect('hello world'.includes('test')).toBe(false);
  });
});

describe('Array Utilities', () => {
  test('should filter arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers.filter(n => n > 3)).toEqual([4, 5]);
    expect(numbers.filter(n => n % 2 === 0)).toEqual([2, 4]);
  });

  test('should map arrays', () => {
    const numbers = [1, 2, 3];
    expect(numbers.map(n => n * 2)).toEqual([2, 4, 6]);
    expect(numbers.map(n => n.toString())).toEqual(['1', '2', '3']);
  });

  test('should reduce arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers.reduce((sum, n) => sum + n, 0)).toBe(15);
    expect(numbers.reduce((max, n) => Math.max(max, n), 0)).toBe(5);
  });

  test('should find in arrays', () => {
    const users = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    expect(users.find(u => u.id === 1)).toEqual({ id: 1, name: 'John' });
    expect(users.find(u => u.id === 3)).toBeUndefined();
  });

  test('should check array inclusion', () => {
    const roles = ['STUDENT', 'TUTOR', 'ADMIN'];
    expect(roles.includes('STUDENT')).toBe(true);
    expect(roles.includes('INVALID')).toBe(false);
  });
});

describe('Object Utilities', () => {
  test('should merge objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3, d: 4 };
    expect({ ...obj1, ...obj2 }).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  test('should extract object keys', () => {
    const obj = { name: 'John', age: 30, role: 'STUDENT' };
    expect(Object.keys(obj)).toEqual(['name', 'age', 'role']);
  });

  test('should extract object values', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(Object.values(obj)).toEqual([1, 2, 3]);
  });

  test('should check object properties', () => {
    const user = { id: 1, email: 'test@example.com' };
    expect('id' in user).toBe(true);
    expect('name' in user).toBe(false);
  });
});

describe('Date Utilities', () => {
  test('should create dates', () => {
    const now = new Date();
    expect(now).toBeInstanceOf(Date);
    expect(now.getTime()).toBeGreaterThan(0);
  });

  test('should compare dates', () => {
    const date1 = new Date('2025-01-01');
    const date2 = new Date('2025-12-31');
    expect(date2.getTime()).toBeGreaterThan(date1.getTime());
  });

  test('should format dates', () => {
    const date = new Date('2025-11-18T10:00:00Z');
    expect(date.toISOString()).toContain('2025-11-18');
  });

  test('should calculate time differences', () => {
    const start = new Date('2025-11-18T10:00:00');
    const end = new Date('2025-11-18T11:00:00');
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    expect(diffHours).toBe(1);
  });
});

describe('Number Utilities', () => {
  test('should perform math operations', () => {
    expect(Math.max(1, 5, 3)).toBe(5);
    expect(Math.min(1, 5, 3)).toBe(1);
    expect(Math.round(3.7)).toBe(4);
    expect(Math.floor(3.9)).toBe(3);
    expect(Math.ceil(3.1)).toBe(4);
  });

  test('should calculate percentages', () => {
    const calculatePercentage = (part: number, total: number) => (part / total) * 100;
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(1, 4)).toBe(25);
  });

  test('should parse numbers', () => {
    expect(parseInt('123')).toBe(123);
    expect(parseFloat('123.45')).toBe(123.45);
    expect(Number('456')).toBe(456);
  });
});

describe('Type Checking', () => {
  test('should check primitive types', () => {
    expect(typeof 'string').toBe('string');
    expect(typeof 123).toBe('number');
    expect(typeof true).toBe('boolean');
    expect(typeof undefined).toBe('undefined');
  });

  test('should check object types', () => {
    expect(Array.isArray([])).toBe(true);
    expect(Array.isArray({})).toBe(false);
    expect(new Date()).toBeInstanceOf(Date);
  });
});

describe('Error Handling', () => {
  test('should create errors', () => {
    const error = new Error('Test error');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
  });

  test('should throw and catch errors', () => {
    const throwError = () => {
      throw new Error('Thrown error');
    };
    expect(throwError).toThrow('Thrown error');
  });

  test('should handle error types', () => {
    try {
      throw new TypeError('Type error');
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      expect((error as Error).message).toBe('Type error');
    }
  });
});

describe('JSON Operations', () => {
  test('should stringify objects', () => {
    const obj = { name: 'John', age: 30 };
    expect(JSON.stringify(obj)).toBe('{"name":"John","age":30}');
  });

  test('should parse JSON strings', () => {
    const jsonStr = '{"name":"John","age":30}';
    expect(JSON.parse(jsonStr)).toEqual({ name: 'John', age: 30 });
  });
});

describe('Promise Operations', () => {
  test('should resolve promises', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });

  test('should reject promises', async () => {
    const promise = Promise.reject(new Error('failed'));
    await expect(promise).rejects.toThrow('failed');
  });

  test('should handle Promise.all', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ];
    const results = await Promise.all(promises);
    expect(results).toEqual([1, 2, 3]);
  });
});
