import { httpJson }   from '../../../core/http.mjs';
import { getCache }   from '../../../core/cache.mjs';
import { getBreaker } from '../../../core/circuit-breaker.mjs';

const cache   = getCache('bridge', { defaultTtlMs: 60_000 });
const breaker = getBreaker('bridge-apis', { threshold: 5 });

const LIFI = 'https://li.quest/v1';

export async function routes(args = {}) {
  if (!args.fromChain || !args.toChain || !args.fromToken || !args.toToken || !args.fromAmount) {
    return {
      ok: false,
      error: 'Missing required args: --fromChain --toChain --fromToken --toToken --fromAmount',
      example: 'node modules/bridge/run.mjs routes --fromChain 1 --toChain 56 --fromToken 0x... --toToken 0x... --fromAmount 100000000',
    };
  }

  return breaker.call(async () => {
    const key = `routes:${args.fromChain}:${args.toChain}:${args.fromAmount}`;
    const c = cache.get(key);
    if (c) return c;

    const url = `${LIFI}/routes?fromChainId=${args.fromChain}&toChainId=${args.toChain}&fromTokenAddress=${args.fromToken}&toTokenAddress=${args.toToken}&fromAmount=${args.fromAmount}&order=CHEAPEST`;
    const r = await httpJson(url);
    if (!r.ok) return { ok: false, error: `LI.FI API error: ${r.status}` };

    const routes = (r.data?.routes ?? []).slice(0, 5).map(rt => ({
      id:           rt.id,
      steps:        rt.steps?.length ?? 0,
      fromAmount:   rt.fromAmount,
      toAmountMin:  rt.toAmountMin,
      gasEstimate:  rt.gasCostUSD,
      durationSec:  rt.steps?.reduce((s, st) => s + (st.estimate?.executionDuration ?? 0), 0),
      via:          rt.steps?.map(s => s.toolDetails?.name ?? s.type).join(' → '),
    }));

    const result = { ok: true, routes, count: routes.length };
    cache.set(key, result);
    return result;
  }).catch(err => ({ ok: false, error: err.message }));
}

export async function fees(args = {}) {
  const result = await routes(args);
  if (!result.ok) return result;
  return {
    ok: true,
    cheapest: result.routes[0] ?? null,
    allRoutes: result.routes.map(r => ({ via: r.via, gasUsd: r.gasEstimate, durationMin: Math.round((r.durationSec ?? 0) / 60) })),
  };
}

export async function status(args = {}) {
  if (!args.txHash) return { ok: false, error: 'Missing --txHash' };
  return breaker.call(async () => {
    const r = await httpJson(`${LIFI}/status?txHash=${args.txHash}`);
    return r.ok ? { ok: true, status: r.data } : { ok: false, error: `Status API error: ${r.status}` };
  }).catch(err => ({ ok: false, error: err.message }));
}
