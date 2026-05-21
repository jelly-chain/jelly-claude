import { getCache } from '../../../core/cache.mjs';

const cache = getCache('backtester', { defaultTtlMs: 60_000 });

export async function simulate(args = {}) {
  if (!args.strategy) return { ok: false, error: 'Missing --strategy' };
  if (!args.dataset) return { ok: false, error: 'Missing --dataset' };
  const start = args.start ? new Date(args.start).getTime() : Date.now() - 90 * 24 * 60 * 60 * 1000; // last 90 days
  const end = args.end ? new Date(args.end).getTime() : Date.now();

  // Simulate backtest
  const result = {
    ok: true,
    strategy: args.strategy,
    dataset: args.dataset,
    startDate: new Date(start),
    endDate: new Date(end),
    totalReturn: Math.random() * 100 - 20, // Mock return between -20% and 100%
    sharpeRatio: Math.random() * 2 - 0.5,
    maxDrawdown: Math.random() * 20,
    trades: Math.floor(Math.random() * 1000),
  };
  return result;
}

export async function optimize(args = {}) {
  if (!args.strategy) return { ok: false, error: 'Missing --strategy' };
  // Run optimization
  return { ok: true, strategy: args.strategy, optimizedParams: { period: 20, threshold: 0.5 } };
}

export async function compare(args = {}) {
  if (!args.strategy1 || !args.strategy2) return { ok: false, error: 'Missing --strategy1 and --strategy2' };
  const result1 = await simulate({ ...args, strategy: args.strategy1 });
  const result2 = await simulate({ ...args, strategy: args.strategy2 });
  return { ok: true, strategy1: result1, strategy2: result2, winner: result1.totalReturn > result2.totalReturn ? 'strategy1' : 'strategy2' };
}