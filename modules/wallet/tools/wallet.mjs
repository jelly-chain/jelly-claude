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

export async function balance(args = {}) {
  const address = args.address ?? (() => {
    const sw = loadWalletFile(SOLANA_WALLET);
    return sw?.publicKey ?? null;
  })();

  if (!address) return { ok: false, error: 'Provide --address or set up your wallet via setup.sh' };

  const chain = args.chain ?? 'solana';
  const cacheKey = `bal:${chain}:${address}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (chain === 'solana') {
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
  }

  return { ok: true, chain, address, balance: null, note: `Balance check for ${chain} — use EVM RPC with your private key` };
}

export async function info(args = {}) {
  const solWallet = loadWalletFile(SOLANA_WALLET);
  const evmWallet = loadWalletFile(EVM_WALLET);
  return {
    ok: true,
    solana: solWallet ? { publicKey: solWallet.publicKey ?? '(keypair array format)' } : null,
    evm:    evmWallet ? { address: evmWallet.address } : null,
    note:   'Private keys are never displayed',
  };
}

export async function watch(args = {}) {
  if (!args.address || !args.chain) return { ok: false, error: 'Missing --address or --chain' };
  monitor.addWallet(args.address, args.chain, args.label);
  await memory.set('watchedWallets', monitor._wallets);
  return { ok: true, message: `Now watching ${args.address} on ${args.chain}`, total: monitor._wallets.length };
}

export async function unwatch(args = {}) {
  if (!args.address) return { ok: false, error: 'Missing --address' };
  monitor._wallets = monitor._wallets.filter(w => w.address !== args.address);
  return { ok: true, message: `Stopped watching ${args.address}`, total: monitor._wallets.length };
}

export async function monitored(args = {}) {
  const result = await monitor.execute({}, memory);
  return { ok: true, wallets: monitor._wallets, checkResult: result };
}
