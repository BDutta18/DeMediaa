import { Request } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parses page/limit query params from the request, with safe defaults and caps.
 *
 * @param req        Express request object
 * @param maxLimit   Maximum allowed limit per page (default: 100)
 * @param defaultLimit  Default items per page (default: 20)
 */
export const parsePagination = (
  req: Request,
  maxLimit = 100,
  defaultLimit = 20,
): PaginationMeta => {
  const rawPage = parseInt(String(req.query.page ?? '1'), 10);
  const rawLimit = parseInt(String(req.query.limit ?? String(defaultLimit)), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, maxLimit)
    : defaultLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/**
 * Builds a paginated response envelope.
 */
export const paginatedResponse = <T>(
  data: T[],
  total: number,
  meta: PaginationMeta,
) => ({
  success: true,
  data,
  pagination: {
    page: meta.page,
    limit: meta.limit,
    total,
    totalPages: Math.ceil(total / meta.limit),
    hasNext: meta.page * meta.limit < total,
    hasPrev: meta.page > 1,
  },
});
