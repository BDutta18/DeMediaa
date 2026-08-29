import { Request, Response, NextFunction } from 'express';

/**
 * Validates that all required fields are present and non-empty in req.body.
 * Returns 400 Bad Request with a descriptive message if any field is missing.
 *
 * @param fields  Array of required field names
 */
export const requireFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing: string[] = [];

    for (const field of fields) {
      const value = req.body?.[field];
      if (value === undefined || value === null || value === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: `Missing required fields: ${missing.join(', ')}`,
        fields: missing,
      });
      return;
    }

    next();
  };
};

/**
 * Validates that a numeric rating field (default name: 'rating') is between min and max.
 */
export const validateRating = (
  field = 'rating',
  min = 1,
  max = 5,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const raw = req.body?.[field];
    const value = Number(raw);

    if (!Number.isFinite(value) || value < min || value > max) {
      res.status(400).json({
        success: false,
        code: 'INVALID_RATING',
        message: `'${field}' must be a number between ${min} and ${max}.`,
      });
      return;
    }

    next();
  };
};
