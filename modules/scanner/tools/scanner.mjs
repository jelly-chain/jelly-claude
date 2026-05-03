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
