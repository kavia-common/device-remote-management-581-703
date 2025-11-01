import { Request } from 'express';

export type Pagination = {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
};

/**
 * PUBLIC_INTERFACE
 * Extracts pagination parameters from request query with defaults and caps.
 */
export function getPagination(req: Request, defaults: { page?: number; pageSize?: number } = {}): Pagination {
  /** Returns normalized pagination settings from query params. */
  const page = Math.max(1, Number(req.query.page ?? defaults.page ?? 1));
  const pageSizeRaw = Number(req.query.pageSize ?? defaults.pageSize ?? 50);
  const pageSize = Math.min(100, Math.max(1, Number.isFinite(pageSizeRaw) ? pageSizeRaw : 50));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset, limit: pageSize };
}
