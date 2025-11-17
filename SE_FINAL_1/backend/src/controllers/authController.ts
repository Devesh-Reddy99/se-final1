import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { AppError } from '../middlewares/error.middleware';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { email, password, firstName, lastName, role, phone } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '10'));

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'STUDENT',
      phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key'
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'your-secret-key'
  );

  res.status(201).json({
    status: 'success',
    data: {
      user,
      token,
      refreshToken,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate tokens
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key'
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'your-secret-key'
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    },
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 400);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    ) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.status(200).json({
      status: 'success',
      data: { token: newToken },
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};
