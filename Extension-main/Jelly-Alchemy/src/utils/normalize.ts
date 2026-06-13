/** Provider response normalization — strips raw fields into clean typed shapes. */

export interface NormalizedBalance {
  address: string;
  balance: string;
  symbol: string;
  decimals: number;
}

export interface NormalizedTransfer {
  from: string;
  to: string;
  value: string;
  asset: string;
  blockNum: string;
  hash: string;
  category: string;
}

export function normalizeTokenBalance(raw: Record<string, unknown>): NormalizedBalance {
  return {
    address: typeof raw['contractAddress'] === 'string' ? raw['contractAddress'] : '',
    balance: typeof raw['tokenBalance'] === 'string' ? raw['tokenBalance'] : '0x0',
    symbol: typeof raw['symbol'] === 'string' ? raw['symbol'] : 'UNKNOWN',
    decimals: typeof raw['decimals'] === 'number' ? raw['decimals'] : 18,
  };
}

export function normalizeTransfer(raw: Record<string, unknown>): NormalizedTransfer {
  return {
    from: typeof raw['from'] === 'string' ? raw['from'] : '',
    to: typeof raw['to'] === 'string' ? raw['to'] : '',
    value: typeof raw['value'] === 'string' ? raw['value'] : '0',
    asset: typeof raw['asset'] === 'string' ? raw['asset'] : '',
    blockNum: typeof raw['blockNum'] === 'string' ? raw['blockNum'] : '0x0',
    hash: typeof raw['hash'] === 'string' ? raw['hash'] : '',
    category: typeof raw['category'] === 'string' ? raw['category'] : 'unknown',
  };
}

export function safeString(val: unknown, fallback = ''): string {
  return typeof val === 'string' ? val : fallback;
}

export function safeNumber(val: unknown, fallback = 0): number {
  return typeof val === 'number' ? val : fallback;
}

export function safeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}
