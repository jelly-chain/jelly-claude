import { ScannerAgent } from '../../../ai-agents/scanner.js';
import { createMemory }  from '../../../memory/index.js';

const agent  = new ScannerAgent();
const memory = createMemory();

export async function scan(args = {}) {
  return agent.execute({ chain: args.chain ?? 'solana', query: args.query }, memory);
}

export async function newTokens(args = {}) {
  const chain   = args.chain   ?? 'solana';
  const maxAge  = args.maxAge  ? Number(args.maxAge) : 30;
  const pairs   = await agent.newTokens(chain, maxAge);
  return { ok: true, chain, maxAgeMinutes: maxAge, count: pairs.length, tokens: pairs.slice(0, 20) };
}

export async function trending(args = {}) {
  const chain = args.chain ?? 'solana';
  const result = await agent.execute({ chain, query: 'trending' }, memory);
  return { ok: true, chain, trending: result.topPairs ?? [] };
}

export async function search(args = {}) {
  if (!args.query) return { ok: false, error: 'Missing --query' };
  return agent.execute({ chain: args.chain ?? 'solana', query: args.query }, memory);
}

// New enhanced functions
export async function volumeSpike(args = {}) {
  const chain = args.chain ?? 'solana';
  const minVolume = args.minVolume ? Number(args.minVolume) : 100000;
  const pairs = await agent.volumeSpike(chain, minVolume);
  return { ok: true, chain, minVolume, count: pairs.length, spikes: pairs };
}

export async function rugCheck(args = {}) {
  if (!args.address) return { ok: false, error: 'Missing --address' };
  const chain = args.chain ?? 'solana';
  const risk = await agent.rugCheck(chain, args.address);
  return { ok: true, address: args.address, chain, riskScore: risk.score, risks: risk.issues };
}

export async function topHolders(args = {}) {
  if (!args.address) return { ok: false, error: 'Missing --address' };
  const chain = args.chain ?? 'solana';
  const holders = await agent.topHolders(chain, args.address, args.limit ? Number(args.limit) : 10);
  return { ok: true, address: args.address, chain, holders };
}

export async function tokenMetadata(args = {}) {
  if (!args.address) return { ok: false, error: 'Missing --address' };
  const chain = args.chain ?? 'solana';
  const metadata = await agent.tokenMetadata(chain, args.address);
  return { ok: true, address: args.address, chain, metadata };
}
