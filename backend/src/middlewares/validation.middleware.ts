import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['STUDENT', 'TUTOR']).withMessage('Invalid role'),
];

export const loginValidation: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createTutorValidation: ValidationChain[] = [
  body('bio').optional().isString(),
  body('subjects').isArray().withMessage('Subjects must be an array'),
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('experience').optional().isInt({ min: 0 }),
  body('education').optional().isString(),
];

export const createSlotValidation: ValidationChain[] = [
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('duration').optional().isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
  body('recurrence').optional().isIn(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
  body('recurrenceEnd').optional().isISO8601(),
  body('recurrenceCount').optional().isInt({ min: 1, max: 30 }).withMessage('Recurrence count must be between 1 and 30'),
];

export const createBookingValidation: ValidationChain[] = [
  body('slotId').isUUID().withMessage('Valid slot ID is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('notes').optional().isString(),
];
