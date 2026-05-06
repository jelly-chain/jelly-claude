/** Time-window helpers — durations, block ranges, and volatility windows. */

import { BLOCKS_PER_MINUTE, BLOCKS_PER_HOUR, BLOCKS_PER_DAY } from '../config/chains.js';

export type WindowLabel = '1m' | '5m' | '15m' | '1h' | '4h' | '24h' | '7d';

export interface BlockRange {
  fromBlock: number;
  toBlock: number;
  windowSeconds: number;
}

const WINDOW_SECONDS: Record<WindowLabel, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '24h': 86400,
  '7d': 604800,
};

const WINDOW_BLOCKS: Record<WindowLabel, number> = {
  '1m': BLOCKS_PER_MINUTE,
  '5m': BLOCKS_PER_MINUTE * 5,
  '15m': BLOCKS_PER_MINUTE * 15,
  '1h': BLOCKS_PER_HOUR,
  '4h': BLOCKS_PER_HOUR * 4,
  '24h': BLOCKS_PER_DAY,
  '7d': BLOCKS_PER_DAY * 7,
};

export function windowToSeconds(label: WindowLabel): number {
  return WINDOW_SECONDS[label];
}

export function windowToBlocks(label: WindowLabel): number {
  return WINDOW_BLOCKS[label];
}

export function blockRangeFromWindow(currentBlock: number, window: WindowLabel): BlockRange {
  const blocks = WINDOW_BLOCKS[window];
  const seconds = WINDOW_SECONDS[window];
  return {
    fromBlock: Math.max(0, currentBlock - blocks),
    toBlock: currentBlock,
    windowSeconds: seconds,
  };
}

export function timestampToBlock(
  targetTimestamp: number,
  currentBlock: number,
  currentTimestamp: number,
  blockTimeSeconds = 2,
): number {
  const secondsDiff = currentTimestamp - targetTimestamp;
  const blocksDiff = Math.floor(secondsDiff / blockTimeSeconds);
  return Math.max(0, currentBlock - blocksDiff);
}

export function windowStart(label: WindowLabel): Date {
  const now = Date.now();
  return new Date(now - windowToSeconds(label) * 1000);
}

export function isWithinWindow(timestamp: string, label: WindowLabel): boolean {
  const start = windowStart(label).getTime();
  const ts = new Date(timestamp).getTime();
  return ts >= start;
}
