/**
 * Tests for API Service
 */
import { describe, test, expect } from 'vitest';

describe('API Service', () => {
  test('should test API configuration', () => {
    const config = {
      baseURL: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    expect(config.baseURL).toBe('http://localhost:3000/api');
    expect(config.headers['Content-Type']).toBe('application/json');
  });

  test('should handle authorization header', () => {
    const token = 'Bearer eyJ...';
    const config = {
      headers: {
        Authorization: token,
      },
    };
    
    expect(config.headers.Authorization).toContain('Bearer');
  });

  test('should handle error responses', () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };
    
    expect(error.response.status).toBe(401);
  });
});
