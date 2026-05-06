/** Pagination helpers for Alchemy and Polymarket API responses. */

export interface PageCursor {
  cursor: string | null;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  page: PageCursor;
  total?: number;
}

export function emptyPage<T>(): PaginatedResult<T> {
  return { items: [], page: { cursor: null, hasMore: false } };
}

export function buildPageFromAlchemy<T>(
  data: unknown,
  itemMapper: (item: unknown) => T,
): PaginatedResult<T> {
  const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
  const rawItems = Array.isArray(record['result']) ? record['result'] : [];
  const pageKey = typeof record['pageKey'] === 'string' ? record['pageKey'] : null;

  return {
    items: rawItems.map(itemMapper),
    page: { cursor: pageKey, hasMore: pageKey !== null },
  };
}

export function buildPageFromPolymarket<T>(
  data: unknown,
  itemMapper: (item: unknown) => T,
): PaginatedResult<T> {
  const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
  const rawItems = Array.isArray(record['data']) ? record['data'] : [];
  const nextCursor = typeof record['next_cursor'] === 'string' ? record['next_cursor'] : null;
  const count = typeof record['count'] === 'number' ? record['count'] : undefined;

  return {
    items: rawItems.map(itemMapper),
    page: { cursor: nextCursor, hasMore: nextCursor !== null && nextCursor !== 'LTE=' },
    total: count,
  };
}

export function mergePaginatedResults<T>(pages: PaginatedResult<T>[]): PaginatedResult<T> {
  const allItems = pages.flatMap((p) => p.items);
  const lastPage = pages[pages.length - 1];
  return {
    items: allItems,
    page: lastPage ? lastPage.page : { cursor: null, hasMore: false },
    total: allItems.length,
  };
}
