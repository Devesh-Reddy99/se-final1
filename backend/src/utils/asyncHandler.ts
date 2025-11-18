import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/ban-types
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
