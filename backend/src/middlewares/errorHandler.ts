import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
}

/**
 * Typed global error-handler middleware.
 * Must be registered as the LAST middleware in app.ts (after all routes).
 * Converts errors to consistent JSON responses with appropriate HTTP status codes.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = err.status ?? 500;
  const isDev = process.env.NODE_ENV === 'development';

  console.error([] Error : );

  res.status(status).json({
    success: false,
    code: err.code ?? 'INTERNAL_ERROR',
    message: err.message ?? 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
};

/**
 * Helper to create a well-typed AppError.
 */
export const createError = (
  message: string,
  status = 500,
  code?: string,
): AppError => {
  const err = new Error(message) as AppError;
  err.status = status;
  if (code) err.code = code;
  return err;
};
