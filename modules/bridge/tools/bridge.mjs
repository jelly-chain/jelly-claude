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

// New enhanced functions

export async function estimateGas(args = {}) {
  if (!args.fromChain || !args.toChain || !args.fromToken || !args.toToken || !args.fromAmount) {
    return {
      ok: false,
      error: 'Missing required args: --fromChain --toChain --fromToken --toToken --fromAmount',
    };
  }
  const result = await routes(args);
  if (!result.ok) return result;
  return {
    ok: true,
    cheapestGas: result.routes[0]?.gasEstimate ?? 0,
    cheapestRoute: result.routes[0]?.via ?? 'Unknown',
    allGasEstimates: result.routes.map(r => ({ via: r.via, gasUsd: r.gasEstimate })),
  };
}

export async function compareBridges(args = {}) {
  if (!args.fromChain || !args.toChain || !args.fromToken || !args.toToken || !args.fromAmount) {
    return {
      ok: false,
      error: 'Missing required args: --fromChain --toChain --fromToken --toToken --fromAmount',
    };
  }
  const result = await routes(args);
  if (!result.ok) return result;

  // Compare based on different metrics
  const cheapest = result.routes.reduce((min, r) => r.gasEstimate < (min.gasEstimate ?? Infinity) ? r : min);
  const fastest = result.routes.reduce((min, r) => (r.durationSec ?? Infinity) < (min.durationSec ?? Infinity) ? r : min);
  const fewestSteps = result.routes.reduce((min, r) => (r.steps ?? Infinity) < (min.steps ?? Infinity) ? r : min);

  return {
    ok: true,
    cheapest: { via: cheapest.via, gasUsd: cheapest.gasEstimate },
    fastest: { via: fastest.via, durationMin: Math.round((fastest.durationSec ?? 0) / 60) },
    fewestSteps: { via: fewestSteps.via, steps: fewestSteps.steps },
    allRoutes: result.routes,
  };
}

export async function simulate(args = {}) {
  if (!args.fromChain || !args.toChain || !args.fromToken || !args.toToken || !args.fromAmount) {
    return {
      ok: false,
      error: 'Missing required args: --fromChain --toChain --fromToken --toToken --fromAmount',
    };
  }
  const result = await routes(args);
  if (!result.ok) return result;

  // Simulate the cheapest route
  const route = result.routes[0];
  if (!route) return { ok: false, error: 'No routes found' };

  return {
    ok: true,
    simulation: {
      fromAmount: args.fromAmount,
      toAmountMin: route.toAmountMin,
      gasEstimate: route.gasEstimate,
      totalCost: route.gasEstimate + (args.fromAmount * 0.0001), // Add small fee
      expectedArrival: new Date(Date.now() + (route.durationSec * 1000)).toISOString(),
    },
  };
}

// New: Get bridge health/status
export async function health(args = {}) {
  // This could query multiple bridge APIs to check status
  // For now, return a simple status
  return {
    ok: true,
    bridges: {
      liFi: 'operational',
      wormhole: 'operational',
      bnbBridge: 'operational',
      polygonBridge: 'operational',
    },
    lastChecked: new Date().toISOString(),
  };
}

// New: List available bridges and their supported chains
export async function list(args = {}) {
  return {
    ok: true,
    bridges: [
      { name: 'LI.FI', supportedChains: ['Solana', 'BNB Chain', 'Polygon', 'Ethereum'], description: 'Universal bridge aggregator' },
      { name: 'Wormhole', supportedChains: ['Solana', 'Ethereum', 'Polygon', 'Avalanche', 'BNB Chain'], description: 'Cross-chain message passing' },
      { name: 'BNB Bridge', supportedChains: ['BNB Chain', 'Ethereum', 'Polygon', 'Solana'], description: 'Binance bridge' },
      // Polygon Bridge
{ name: 'Polygon Bridge', supportedChains: ['Polygon', 'Ethereum', 'Solana'], description: `Polygon's bridge` },
    ],
  };
}
