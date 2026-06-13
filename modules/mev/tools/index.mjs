/**
 * modules/mev/tools/index.mjs
 *
 * Solana MEV module — Jito bundle submission, tip floor, simulation.
 * Requires: HELIUS_API_KEY for enhanced tx parsing, SOLANA_PRIVATE_KEY for signing.
 *
 * Jito Block Engine endpoints (no key needed for public bundle submission):
 *   mainnet: https://mainnet.block-engine.jito.wtf/api/v1
 */

import { httpJson, httpPost } from '../../../core/rate-limiter.mjs';
import { createLogger }       from '../../../core/logger.mjs';
import { getCache }           from '../../../core/cache.mjs';

const log   = createLogger('mev-module');
const cache = getCache('mev', { defaultTtlMs: 10_000 });

const JITO_URL   = process.env.JITO_BLOCK_ENGINE_URL ?? 'https://mainnet.block-engine.jito.wtf/api/v1';
const HELIUS_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = HELIUS_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`
  : 'https://api.mainnet-beta.solana.com';

// ── Tip floor ─────────────────────────────────────────────────────────────────

async function getTipFloor() {
  return cache.getOrFetch('jito:tip-floor', async () => {
    const r = await httpJson(`${JITO_URL}/bundles/tip_floor`, { timeoutMs: 6_000 });
    if (!r.ok || !r.data) return { p25: 1000, p50: 5000, p75: 10000, p95: 100000 };
    const d = r.data[0] ?? r.data;
    return {
      p25:  Math.round(d.landed_tips_25th_percentile ?? 1000),
      p50:  Math.round(d.landed_tips_50th_percentile ?? 5000),
      p75:  Math.round(d.landed_tips_75th_percentile ?? 10000),
      p95:  Math.round(d.landed_tips_95th_percentile ?? 100000),
      ema:  Math.round(d.ema_landed_tips_50th_percentile ?? 5000),
    };
  }, 30_000);
}

// ── Bundle simulation ─────────────────────────────────────────────────────────

async function simulateBundle(encodedTransactions) {
  if (!Array.isArray(encodedTransactions) || !encodedTransactions.length) {
    return { ok: false, error: 'No transactions provided' };
  }

  // Simulate each transaction individually via RPC before bundling
  const results = await Promise.all(encodedTransactions.map(async (tx) => {
    const r = await httpPost(HELIUS_RPC, {
      jsonrpc: '2.0', id: 1,
      method:  'simulateTransaction',
      params:  [tx, { encoding: 'base64', commitment: 'processed', replaceRecentBlockhash: true }],
    }, { timeoutMs: 10_000 });
    if (!r.ok) return { ok: false, error: 'RPC error' };
    const sim = r.data?.result?.value;
    return {
      ok:         !sim?.err,
      error:      sim?.err ? JSON.stringify(sim.err) : null,
      unitsConsumed: sim?.unitsConsumed ?? null,
      logs:       sim?.logs ?? [],
    };
  }));

  const allOk = results.every(r => r.ok);
  return {
    ok:     allOk,
    txCount: encodedTransactions.length,
    simulations: results,
    error: allOk ? null : 'One or more transactions failed simulation',
  };
}

// ── Bundle submission ─────────────────────────────────────────────────────────

async function submitBundle(encodedTransactions) {
  if (!Array.isArray(encodedTransactions) || !encodedTransactions.length) {
    return { ok: false, error: 'No transactions provided' };
  }

  const r = await httpPost(`${JITO_URL}/bundles`, {
    jsonrpc: '2.0', id: 1,
    method:  'sendBundle',
    params:  [encodedTransactions],
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeoutMs: 15_000,
  });

  if (!r.ok) {
    log.error('Bundle submission failed', { status: r.status, data: r.data });
    return { ok: false, error: r.data?.error?.message ?? 'Submission failed' };
  }

  const bundleId = r.data?.result;
  log.info('Bundle submitted', { bundleId });
  return { ok: true, bundleId, ts: Date.now() };
}

// ── Bundle status ─────────────────────────────────────────────────────────────

async function getBundleStatus(bundleId) {
  const r = await httpPost(`${JITO_URL}/bundles`, {
    jsonrpc: '2.0', id: 1,
    method:  'getBundleStatuses',
    params:  [[bundleId]],
  }, { timeoutMs: 8_000 });

  if (!r.ok || !r.data?.result?.value) return { ok: false, bundleId };
  const status = r.data.result.value[0];
  return {
    ok:           true,
    bundleId,
    status:       status?.confirmation_status ?? 'unknown',
    err:          status?.err ?? null,
    transactions: status?.transactions ?? [],
  };
}

// ── Arbitrage opportunity scanner ─────────────────────────────────────────────

async function findArbOpportunities(inputMint, outputMint, amountLamports = 1_000_000) {
  // Compare Jupiter quote vs Raydium price via DexScreener
  const [jupR, dsR] = await Promise.allSettled([
    httpJson(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50`,
      { timeoutMs: 8_000 }
    ),
    httpJson(
      `https://api.dexscreener.com/latest/dex/tokens/${inputMint}`,
      { timeoutMs: 8_000 }
    ),
  ]);

  const jupPrice  = jupR.status === 'fulfilled' && jupR.value.ok ? parseFloat(jupR.value.data?.outAmount ?? 0) / amountLamports : 0;
  const dsPairs   = dsR.status === 'fulfilled' && dsR.value.ok ? (dsR.value.data?.pairs ?? []) : [];
  const bestDsPrice = dsPairs.length > 0
    ? Math.max(...dsPairs.map(p => parseFloat(p.priceNative ?? 0)))
    : 0;

  const spread = bestDsPrice > 0 && jupPrice > 0 ? Math.abs(jupPrice - bestDsPrice) / Math.min(jupPrice, bestDsPrice) : 0;

  return {
    ok:           true,
    inputMint,
    outputMint,
    jupiterPrice: jupPrice,
    dexPrice:     bestDsPrice,
    spread:       parseFloat(spread.toFixed(6)),
    spreadPct:    parseFloat((spread * 100).toFixed(3)),
    profitable:   spread > 0.003, // >0.3% spread after fees
    ts:           Date.now(),
  };
}

// ── Main entry ────────────────────────────────────────────────────────────────

export default async function main(opts = {}) {
  const action = opts.action ?? 'tip_floor';

  switch (action) {
    case 'tip_floor':
      return { ok: true, module: 'mev', action, data: await getTipFloor() };

    case 'simulate':
      return { ok: true, module: 'mev', action, data: await simulateBundle(opts.transactions ?? []) };

    case 'submit':
      return { ok: true, module: 'mev', action, data: await submitBundle(opts.transactions ?? []) };

    case 'status':
      if (!opts.bundleId) return { ok: false, error: 'bundleId required' };
      return { ok: true, module: 'mev', action, data: await getBundleStatus(opts.bundleId) };

    case 'arb_scan':
      return {
        ok: true, module: 'mev', action,
        data: await findArbOpportunities(
          opts.inputMint  ?? 'So11111111111111111111111111111111111111112',
          opts.outputMint ?? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          opts.amount     ?? 1_000_000,
        ),
      };

    default:
      return { ok: false, error: `Unknown action: ${action}`, module: 'mev' };
  }
}

export { getTipFloor, simulateBundle, submitBundle, getBundleStatus, findArbOpportunities };
