/**
 * modules/blockchain/tools/index.mjs
 *
 * On-chain analytics module — unified blockchain data queries.
 * Sources: Helius (Solana), public EVM RPCs, DexScreener, DeFiLlama
 */

import { httpJson, httpPost } from '../../../core/rate-limiter.mjs';
import { createLogger }       from '../../../core/logger.mjs';
import { getCache }           from '../../../core/cache.mjs';
import {
  getSolanaTokenFlow,
  getTokenHolderConcentration,
  getRecentSwapVolume,
  getWhaleActivity,
} from '../../../core/onchain-feed.mjs';

const log   = createLogger('blockchain-module');
const cache = getCache('blockchain', { defaultTtlMs: 30_000 });

const HELIUS_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = HELIUS_KEY ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}` : 'https://api.mainnet-beta.solana.com';
const HELIUS_API = HELIUS_KEY ? `https://api.helius.xyz/v0` : null;

// ── Block data ────────────────────────────────────────────────────────────────

async function getBlock(chain, slotOrBlock) {
  if (chain === 'solana') {
    const r = await httpPost(HELIUS_RPC, {
      jsonrpc: '2.0', id: 1, method: 'getBlock',
      params: [slotOrBlock, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
    }, { timeoutMs: 15_000 });
    if (!r.ok || !r.data?.result) return null;
    const b = r.data.result;
    return {
      chain, slot: slotOrBlock,
      blockTime:    b.blockTime,
      txCount:      b.transactions?.length ?? 0,
      previousHash: b.previousBlockhash,
      hash:         b.blockhash,
    };
  }
  // EVM chains
  const rpcMap = {
    ethereum: process.env.ALCHEMY_ETH_RPC ?? 'https://eth.llamarpc.com',
    bnb:      'https://bsc-dataseed.binance.org',
    base:     'https://mainnet.base.org',
    polygon:  'https://polygon-rpc.com',
    arbitrum: 'https://arb1.arbitrum.io/rpc',
  };
  const rpc = rpcMap[chain];
  if (!rpc) return { error: `Unsupported chain: ${chain}` };
  const blockParam = typeof slotOrBlock === 'number'
    ? `0x${slotOrBlock.toString(16)}`
    : slotOrBlock ?? 'latest';
  const r = await httpPost(rpc, {
    jsonrpc: '2.0', id: 1, method: 'eth_getBlockByNumber',
    params: [blockParam, false],
  }, { timeoutMs: 10_000 });
  if (!r.ok || !r.data?.result) return null;
  const b = r.data.result;
  return {
    chain,
    blockNumber: parseInt(b.number, 16),
    timestamp:   parseInt(b.timestamp, 16),
    txCount:     b.transactions?.length ?? 0,
    hash:        b.hash,
    gasUsed:     parseInt(b.gasUsed, 16),
    gasLimit:    parseInt(b.gasLimit, 16),
  };
}

// ── Token metadata (Helius DAS API) ──────────────────────────────────────────

async function getTokenMetadata(mint) {
  if (!HELIUS_API) return null;
  return cache.getOrFetch(`meta:${mint}`, async () => {
    const r = await httpPost(
      `${HELIUS_RPC}`,
      { jsonrpc: '2.0', id: 1, method: 'getAsset', params: { id: mint } },
      { timeoutMs: 8_000 }
    );
    if (!r.ok || !r.data?.result) return null;
    const a = r.data.result;
    return {
      mint,
      name:     a.content?.metadata?.name,
      symbol:   a.content?.metadata?.symbol,
      uri:      a.content?.json_uri,
      supply:   a.token_info?.supply,
      decimals: a.token_info?.decimals,
      frozen:   a.token_info?.token_program === 'FreezeAuthority',
    };
  }, 3_600_000);
}

// ── Contract ABI fetch (Etherscan / Sourcify) ─────────────────────────────────

async function getContractABI(address, chain = 'ethereum') {
  const cacheKey = `abi:${chain}:${address}`;
  return cache.getOrFetch(cacheKey, async () => {
    // Try Sourcify first (free, no key)
    const sourcifyChainId = { ethereum: 1, bnb: 56, polygon: 137, base: 8453, arbitrum: 42161 }[chain];
    if (sourcifyChainId) {
      const r = await httpJson(
        `https://repo.sourcify.dev/contracts/full_match/${sourcifyChainId}/${address}/metadata.json`,
        { timeoutMs: 8_000 }
      );
      if (r.ok && r.data?.output?.abi) {
        return { source: 'sourcify', abi: r.data.output.abi, address, chain };
      }
    }
    return { source: 'unavailable', abi: null, note: 'Contract not verified on Sourcify. Supply an Etherscan API key for fallback.' };
  }, 86_400_000); // 24h
}

// ── Wallet trace ─────────────────────────────────────────────────────────────

async function traceWallet(address, chain = 'solana', days = 7) {
  if (chain === 'solana') {
    const flow = await getSolanaTokenFlow(address, days * 24).catch(() => null);
    const whales = await getWhaleActivity(address, 5000).catch(() => []);
    return {
      address, chain, days,
      flow,
      largeTransfers: whales.slice(0, 10),
      ts: Date.now(),
    };
  }
  return { address, chain, days, note: 'EVM wallet trace requires Alchemy or Etherscan key', ts: Date.now() };
}

// ── Main entry ────────────────────────────────────────────────────────────────

export default async function main(opts = {}) {
  const action = opts.action ?? 'block';

  switch (action) {
    case 'block':
      return { ok: true, module: 'blockchain', action, data: await getBlock(opts.chain ?? 'solana', opts.slot ?? opts.block ?? 'latest') };

    case 'token_holders':
      if (!opts.mint) return { ok: false, error: 'mint required' };
      return { ok: true, module: 'blockchain', action, data: await getTokenHolderConcentration(opts.mint) };

    case 'token_flow':
      if (!opts.mint) return { ok: false, error: 'mint required' };
      return { ok: true, module: 'blockchain', action, data: await getSolanaTokenFlow(opts.mint, opts.hours ?? 24) };

    case 'token_metadata':
      if (!opts.mint) return { ok: false, error: 'mint required' };
      return { ok: true, module: 'blockchain', action, data: await getTokenMetadata(opts.mint) };

    case 'contract_abi':
      if (!opts.address) return { ok: false, error: 'address required' };
      return { ok: true, module: 'blockchain', action, data: await getContractABI(opts.address, opts.chain ?? 'ethereum') };

    case 'trace_wallet':
      if (!opts.address) return { ok: false, error: 'address required' };
      return { ok: true, module: 'blockchain', action, data: await traceWallet(opts.address, opts.chain ?? 'solana', opts.days ?? 7) };

    case 'swap_volume':
      if (!opts.token) return { ok: false, error: 'token required' };
      return { ok: true, module: 'blockchain', action, data: await getRecentSwapVolume(opts.token, opts.chain ?? 'solana') };

    case 'whale_activity':
      if (!opts.address) return { ok: false, error: 'address required' };
      return { ok: true, module: 'blockchain', action, data: await getWhaleActivity(opts.address, opts.threshold ?? 10_000) };

    default:
      return { ok: false, error: `Unknown action: ${action}. Valid: block, token_holders, token_flow, token_metadata, contract_abi, trace_wallet, swap_volume, whale_activity` };
  }
}

export { getBlock, getTokenMetadata, getContractABI, traceWallet };
