import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../src/middlewares/auth.middleware';
import { errorHandler, AppError } from '../../src/middlewares/error.middleware';
import { authorize } from '../../src/middlewares/rbac.middleware';
import { upload } from '../../src/middlewares/upload.middleware';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

describe('Middleware Coverage Tests', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      path: '/test',
      originalUrl: '/test',
      method: 'GET',
      ip: '127.0.0.1',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate middleware', () => {
    it('should authenticate with valid token', async () => {
      mockReq.headers.authorization = 'Bearer valid_token';
      
      jest.spyOn(jwt, 'verify').mockReturnValue({
        id: '1',
        email: 'test@example.com',
        role: 'STUDENT',
      } as any);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'STUDENT',
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toBeDefined();
    });

    it('should call next with error when no token', async () => {
      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should call next with error for invalid token format', async () => {
      mockReq.headers.authorization = 'InvalidFormat';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should call next with error for invalid JWT', async () => {
      mockReq.headers.authorization = 'Bearer invalid';

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should call next with error when user not found', async () => {
      mockReq.headers.authorization = 'Bearer valid_token';

      jest.spyOn(jwt, 'verify').mockReturnValue({
        id: '999',
        email: 'test@example.com',
        role: 'STUDENT',
      } as any);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Test error', 400);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
      });
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });

    it('should create AppError with correct properties', () => {
      const error = new AppError('Custom message', 404);

      expect(error.message).toBe('Custom message');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('authorize middleware', () => {
    it('should allow access with correct role', () => {
      mockReq.user = {
        id: '1',
        email: 'test@example.com',
        role: 'STUDENT',
      };

      const middleware = authorize('STUDENT');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow access with one of multiple roles', () => {
      mockReq.user = {
        id: '1',
        email: 'test@example.com',
        role: 'TUTOR',
      };

      const middleware = authorize('STUDENT', 'TUTOR');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should throw error when user not authenticated', () => {
      const middleware = authorize('STUDENT');

      expect(() => middleware(mockReq, mockRes, mockNext)).toThrow(AppError);
    });

    it('should throw error when user lacks required role', () => {
      mockReq.user = {
        id: '1',
        email: 'test@example.com',
        role: 'STUDENT',
      };

      const middleware = authorize('ADMIN');

      expect(() => middleware(mockReq, mockRes, mockNext)).toThrow(AppError);
      expect(() => middleware(mockReq, mockRes, mockNext)).toThrow('Forbidden - Insufficient permissions');
    });
  });

  describe('upload middleware', () => {
    it('should exist and be configured', () => {
      expect(upload).toBeDefined();
      expect(upload.single).toBeDefined();
      expect(upload.array).toBeDefined();
    });
  });
});
