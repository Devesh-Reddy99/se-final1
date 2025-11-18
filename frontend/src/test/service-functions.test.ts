import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../services/index';
import api from '../services/api';

vi.mock('../services/api');

describe('Service Functions Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('userService', () => {
    it('should call updateProfile', async () => {
      const mockData = { firstName: 'John', lastName: 'Doe' };
      const mockResponse = { data: { status: 'success', data: { user: mockData } } };
      
      (api.put as any) = vi.fn().mockResolvedValue(mockResponse);

      const result = await userService.updateProfile(mockData);

      expect(api.put).toHaveBeenCalledWith('/users/profile', mockData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should call getProfile', async () => {
      const mockResponse = { data: { status: 'success', data: { user: { id: '1' } } } };
      
      (api.get as any) = vi.fn().mockResolvedValue(mockResponse);

      const result = await userService.getProfile();

      expect(api.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
