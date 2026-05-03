import { PortfolioAgent } from '../../../ai-agents/portfolio.js';
import { createMemory }   from '../../../memory/index.js';

const agent  = new PortfolioAgent();
const memory = createMemory();

export async function snapshot(args = {}) {
  const wallets = [];
  if (args.solana)  wallets.push({ address: args.solana,  chain: 'solana', label: 'Solana'   });
  if (args.evm)     wallets.push({ address: args.evm,     chain: 'bnb',    label: 'EVM'      });
  if (args.polygon) wallets.push({ address: args.polygon, chain: 'polygon',label: 'Polygon'  });
  if (args.base)    wallets.push({ address: args.base,    chain: 'base',   label: 'Base'     });
  if (wallets.length === 0) return { ok: false, error: 'Provide at least one wallet: --solana <addr>' };
  return agent.execute({ wallets }, memory);
}

export async function summary(args = {}) {
  const last = await memory.get('lastPortfolio');
  if (!last) return { ok: false, error: 'No portfolio snapshot yet — run snapshot first' };
  return { ok: true, summary: agent.summary(last), ...last };
}

export async function pnl(args = {}) {
  const history = memory.history.findByType('portfolio');
  if (history.length < 2) return { ok: false, error: 'Not enough snapshots to compute P&L' };
  const first = history[0].totalUsd;
  const last  = history[history.length - 1].totalUsd;
  const delta = last - first;
  const pct   = first > 0 ? ((delta / first) * 100).toFixed(2) : '0.00';
  return { ok: true, startUsd: first, currentUsd: last, pnlUsd: Math.round(delta * 100) / 100, pnlPct: Number(pct) };
}

export async function addWallet(args = {}) {
  if (!args.address || !args.chain) return { ok: false, error: 'Missing --address or --chain' };
  agent.addWallet(args.address, args.chain, args.label);
  return { ok: true, message: `Watching ${args.address} on ${args.chain}` };
}
