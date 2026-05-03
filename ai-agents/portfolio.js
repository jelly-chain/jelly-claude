import { httpJson }    from '../core/http.mjs';
import { metrics }     from '../core/metrics.mjs';
import { audit }       from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';
import { getCache }    from '../core/cache.mjs';
import { getBreaker }  from '../core/circuit-breaker.mjs';

const log     = createLogger('portfolio-agent');
const cache   = getCache('portfolio', { defaultTtlMs: 120_000 });
const breaker = getBreaker('portfolio-apis', { threshold: 5 });

export class PortfolioAgent {
  constructor(opts = {}) {
    this._wallets = opts.wallets ?? [];
    this._chains  = opts.chains  ?? ['solana', 'bnb', 'polygon', 'base', 'ethereum'];
  }

  addWallet(address, chain, label) {
    this._wallets.push({ address, chain, label: label ?? address.slice(0, 8) });
    return this;
  }

  async execute(input = {}, memory) {
    const t = metrics.startTimer('portfolio.execute');
    metrics.incMetric('portfolio.calls');

    const wallets = input.wallets ?? this._wallets;
    if (wallets.length === 0) return { ok: false, error: 'No wallets configured' };

    const cacheKey = `portfolio:${wallets.map(w => w.address).join(',')}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const results = await Promise.allSettled(wallets.map(w => this._fetchWallet(w)));
    const positions = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .filter(Boolean);

    const totalUsd = positions.reduce((s, p) => s + (p.totalUsd ?? 0), 0);
    const byChain  = {};
    for (const p of positions) {
      byChain[p.chain] = (byChain[p.chain] ?? 0) + (p.totalUsd ?? 0);
    }

    const result = {
      ok: true, wallets: wallets.length, positions,
      totalUsd: Math.round(totalUsd * 100) / 100,
      byChain, ts: Date.now(),
    };

    cache.set(cacheKey, result);
    if (memory) {
      await memory.set('lastPortfolio', result);
      memory.history.push({ type: 'portfolio', totalUsd: result.totalUsd });
    }

    audit.agentCall({ agent: 'portfolio', wallets: wallets.length, totalUsd: result.totalUsd });
    t.end({ agent: 'portfolio' });
    return result;
  }

  async _fetchWallet(w) {
    return breaker.call(async () => {
      if (w.chain === 'solana') {
        const r = await httpJson('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [w.address] }),
        });
        const sol = (r.data?.result?.value ?? 0) / 1e9;
        return { chain: 'solana', address: w.address, label: w.label, nativeBalance: sol, totalUsd: sol * 150 };
      }
      return { chain: w.chain, address: w.address, label: w.label, nativeBalance: 0, totalUsd: 0 };
    }).catch(() => null);
  }

  summary(result) {
    if (!result?.ok) return 'No portfolio data';
    const lines = [`Total: $${result.totalUsd.toLocaleString()}`];
    for (const [chain, usd] of Object.entries(result.byChain)) {
      lines.push(`  ${chain}: $${Math.round(usd).toLocaleString()}`);
    }
    return lines.join('\n');
  }
}

export default PortfolioAgent;
