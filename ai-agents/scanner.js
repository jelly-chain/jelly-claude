import { httpJson }          from '../core/http.mjs';
import { VolumeSpikeDetector } from '../core/anomaly.mjs';
import { predict }             from '../core/prediction.mjs';
import { audit }               from '../core/audit.mjs';
import { metrics }             from '../core/metrics.mjs';
import { createLogger }        from '../core/logger.mjs';
import { getBreaker }          from '../core/circuit-breaker.mjs';
import { getCache }            from '../core/cache.mjs';

const log     = createLogger('scanner-agent');
const breaker = getBreaker('dexscreener', { threshold: 5 });
const cache   = getCache('scanner', { defaultTtlMs: 15_000 });

const DEXSCREENER = 'https://api.dexscreener.com/latest/dex';

export class ScannerAgent {
  constructor(opts = {}) {
    this._minVolume    = opts.minVolume    ?? 50_000;
    this._maxAge       = opts.maxAge       ?? 30;
    this._chains       = opts.chains       ?? ['solana', 'bsc', 'base'];
    this._detector     = new VolumeSpikeDetector({ multiplier: 3, minVolume: opts.minVolume ?? 50_000 });
  }

  async execute(input = {}, memory) {
    const t = metrics.startTimer('scanner.execute');
    metrics.incMetric('scanner.calls');

    const chain = input.chain ?? 'solana';
    const cacheKey = `scan:${chain}:${input.query ?? 'latest'}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const pairs = await this._fetchPairs(chain, input.query);
      const anomalies = pairs.map(p => this._detector.detectFromPair(p)).filter(Boolean);

      const scored = await Promise.all(
        pairs.slice(0, 20).map(async p => {
          const pred = await predict({
            text: `${p.baseToken?.symbol ?? ''} ${p.baseToken?.name ?? ''} volume surge`,
            chain,
            volumeMultiplier: (p.volume?.h24 ?? 0) / Math.max(p.volume?.h6 * 4 ?? 1, 1),
          });
          return { pair: p, prediction: pred };
        })
      );

      const result = {
        ok: true, chain, pairs: pairs.length, anomalies: anomalies.length,
        topPairs: scored.filter(s => s.prediction.jellyScore >= 50).slice(0, 10),
        anomalies,
        ts: Date.now(),
      };

      cache.set(cacheKey, result);
      if (memory) {
        await memory.set('lastScan', result);
        memory.history.push({ type: 'scan', chain, anomalies: anomalies.length });
      }
      audit.agentCall({ agent: 'scanner', chain, pairs: pairs.length });
      return result;
    } catch (err) {
      metrics.incMetric('scanner.errors');
      audit.error({ agent: 'scanner', error: err.message });
      throw err;
    } finally {
      t.end({ agent: 'scanner' });
    }
  }

  async _fetchPairs(chain, query) {
    return breaker.call(async () => {
      const url = query
        ? `${DEXSCREENER}/search?q=${encodeURIComponent(query)}`
        : `${DEXSCREENER}/pairs/${chain}`;
      const r = await httpJson(url);
      if (!r.ok) return [];
      return (r.data?.pairs ?? []).filter(p =>
        (p.volume?.h24 ?? 0) >= this._minVolume
      );
    });
  }

  async newTokens(chain = 'solana', maxAgeMinutes = 30) {
    const all = await this._fetchPairs(chain, null);
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    return all.filter(p => (p.pairCreatedAt ?? 0) > cutoff);
  }
}

export default ScannerAgent;
