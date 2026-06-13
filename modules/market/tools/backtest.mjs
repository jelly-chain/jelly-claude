import { BacktestAgent } from '../../../ai-agents/backtest.js';

const agent = new BacktestAgent();

export async function backtest(args = {}) {
  if (!args.scenarios) return { ok: false, error: 'Missing --scenarios JSON array' };
  let scenarios;
  try { scenarios = JSON.parse(args.scenarios); } catch { return { ok: false, error: 'Invalid --scenarios JSON' }; }
  return agent.execute({
    scenarios,
    initialCapital: args.capital ? Number(args.capital) : 10_000,
  });
}
