import { httpJson }     from '../../../core/http.mjs';
import { MonitorAgent } from '../../../ai-agents/monitor.js';
import { createMemory } from '../../../memory/index.js';
import { getCache }     from '../../../core/cache.mjs';
import { SOLANA_WALLET, EVM_WALLET } from '../../../core/paths.mjs';
import { existsSync, readFileSync }  from 'node:fs';

const memory  = createMemory();
const monitor = new MonitorAgent();
const cache   = getCache('wallet', { defaultTtlMs: 30_000 });

function loadWalletFile(path) {
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8'));
  } catch {}
  return null;
}

// Hardcoded chain info for EVM chains
const CHAIN_INFO = {
  solana: { nativeCurrency: 'SOL', rpc: 'https://api.mainnet-beta.solana.com' },
  bnb:    { nativeCurrency: 'BNB', rpc: 'https://bsc-dataseed.binance.org' },
  polygon:{ nativeCurrency: 'MATIC', rpc: 'https://polygon-rpc.com' },
  ethereum:{ nativeCurrency: 'ETH', rpc: 'https://mainnet.infura.io/v1/jsonrpc' },
  base:   { nativeCurrency: 'ETH', rpc: 'https://mainnet.base.org' },
  arbitrum:{ nativeCurrency: 'ETH', rpc: 'https://arbitrum-mainnet.g.alchemy.com' },
  hyperliquid:{ nativeCurrency: 'HYPE', rpc: 'https://api.hyperliquid.xyz' },
};

/**
 * Get balance for a wallet address on a specific chain.
 * Supports Solana and EVM chains (BNB, Polygon, etc.)
 */
export async function balance(args = {}) {
  const address = args.address ?? (() => {
    const sw = loadWalletFile(SOLANA_WALLET);
    return sw?.publicKey ?? null;
  })();

  if (!address) return { ok: false, error: 'Provide --address or set up your wallet via setup.sh' };

  const chain = (args.chain ?? 'solana').toLowerCase();
  const cacheKey = `bal:${chain}:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Solana
  if (chain === 'solana') {
    try {
      const r = await httpJson('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address] }),
      });
      const lamports = r.data?.result?.value ?? 0;
      const sol = lamports / 1e9;
      const result = { ok: true, chain, address, balance: sol, unit: 'SOL' };
      cache.set(cacheKey, result);
      return result;
    } catch (err) {
      return { ok: false, error: `Solana balance fetch failed: ${err.message}` };
    }
  }

  // EVM chains
  const chainInfo = chains[chain];
  if (!chainInfo) {
    return { ok: false, error: `Unsupported chain: ${chain}. Supported chains: solana, bnb, polygon, ethereum, base, arbitrum, hyperliquid` };
  }

  const rpcUrl = chainInfo.rpc.default;
  if (!rpcUrl) {
    return { ok: false, error: `No RPC URL configured for chain: ${chain}` };
  }

  try {
    const r = await httpJson(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    });
    const hexBalance = r.data?.result;
    if (!hexBalance) throw new Error('No balance returned');
    const balanceWei = BigInt(hexBalance);
    const balanceEth = Number(balanceWei) / 10 ** 18;
    const result = {
      ok: true,
      chain,
      address,
      balance: balanceEth,
      unit: chainInfo.nativeCurrency,
    };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    return { ok: false, error: `EVM balance fetch failed for ${chain}: ${err.message}` };
  }
}

/**
 * Get wallet info for both Solana and EVM wallets.
 */
export async function info(args = {}) {
  const solWallet = loadWalletFile(SOLANA_WALLET);
  const evmWallet = loadWalletFile(EVM_WALLET);
  return {
    ok: true,
    solana: solWallet
      ? {
          publicKey: solWallet.publicKey ?? '(keypair array format)',
          // Optionally, we could fetch balance here but keep it simple
        }
      : null,
    evm: evmWallet ? { address: evmWallet.address } : null,
    note: 'Private keys are never displayed',
  };
}

/**
 * Add a wallet to monitoring.
 * @param {Object} args - { address, chain, label }
 */
export async function watch(args = {}) {
  if (!args.address) return { ok: false, error: 'Missing --address' };
  if (!args.chain) return { ok: false, error: 'Missing --chain' };

  const chain = args.chain.toLowerCase();
  const chainInfo = chains[chain];
  if (!chainInfo) {
    return { ok: false, error: `Unsupported chain: ${chain}` };
  }

  // Validate address format (basic)
  if (chain === 'solana') {
    if (!args.address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      return { ok: false, error: 'Invalid Solana address format' };
    }
  } else {
    // EVM address: 0x followed by 40 hex characters
    if (!args.address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return { ok: false, error: 'Invalid EVM address format' };
    }
  }

  monitor.addWallet(args.address, chain, args.label);
  await memory.set('watchedWallets', monitor._wallets);
  return { ok: true, message: `Now watching ${args.address} on ${chain}`, total: monitor._wallets.length };
}

/**
 * Remove a wallet from monitoring.
 */
export async function unwatch(args = {}) {
  if (!args.address) return { ok: false, error: 'Missing --address' };
  const initialLength = monitor._wallets.length;
  monitor._wallets = monitor._wallets.filter(w => w.address !== args.address);
  if (monitor._wallets.length === initialLength) {
    return { ok: false, error: `Address ${args.address} not found in watch list` };
  }
  await memory.set('watchedWallets', monitor._wallets);
  return { ok: true, message: `Stopped watching ${args.address}`, total: monitor._wallets.length };
}

/**
 * Get list of watched wallets and their current status.
 */
export async function monitored(args = {}) {
  // Ensure we have the latest watched wallets from memory
  const memWallets = await memory.get('watchedWallets');
  if (memWallets) monitor._wallets = memWallets;

  const result = await monitor.execute({}, memory);
  return {
    ok: true,
    wallets: monitor._wallets.map(w => ({
      address: w.address,
      chain: w.chain,
      label: w.label,
    })),
    checkResult: result,
  };
}