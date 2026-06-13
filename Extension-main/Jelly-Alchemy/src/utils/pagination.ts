/** Pagination helpers for Alchemy pageKey / cursor patterns. */

export interface PagedRequest {
  pageKey?: string;
  maxCount?: number;
}

export interface PagedResult<T> {
  items: T[];
  pageKey?: string;
  hasMore: boolean;
}

export function buildPagedRequest(cursor?: string, maxCount = 100): PagedRequest {
  return { pageKey: cursor, maxCount };
}

export function extractPageKey(response: Record<string, unknown>): string | undefined {
  const pk = response['pageKey'];
  return typeof pk === 'string' ? pk : undefined;
}

export async function* paginate<T>(
  fetcher: (cursor?: string) => Promise<PagedResult<T>>,
  maxPages = 20,
): AsyncGenerator<T[]> {
  let cursor: string | undefined;
  let pages = 0;

  while (pages < maxPages) {
    const result = await fetcher(cursor);
    if (result.items.length > 0) yield result.items;
    if (!result.hasMore || result.pageKey === undefined) break;
    cursor = result.pageKey;
    pages++;
  }
}
