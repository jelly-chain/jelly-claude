import { getKeywordTrigger, getThresholdTrigger } from '../core/signals.mjs';
import { httpJson }    from '../core/http.mjs';
import { metrics }     from '../core/metrics.mjs';
import { audit }       from '../core/audit.mjs';
import { bus }         from '../core/events.mjs';
import { createLogger } from '../core/logger.mjs';
import { getCache }    from '../core/cache.mjs';

const log   = createLogger('signal-hunter');
const cache = getCache('signals', { defaultTtlMs: 30_000 });

const LLAMA_TVL = 'https://api.llama.fi';

export class SignalHunterAgent {
  constructor(opts = {}) {
    this._chains    = opts.chains    ?? ['solana', 'bsc', 'ethereum', 'base'];
    this._minScore  = opts.minScore  ?? 60;
    this._kwTrigger = getKeywordTrigger({ minScore: opts.minScore ?? 60 });
    this._thrTrigger = getThresholdTrigger();
  }

  async execute(input = {}, memory) {
    const t = metrics.startTimer('signal-hunter.execute');
    metrics.incMetric('signal_hunter.calls');

    const [defiSignals, newsSignals] = await Promise.allSettled([
      this._scanDefiData(),
      this._scanKeywords(input.texts ?? []),
    ]);

    const signals = [
      ...(defiSignals.value ?? []),
      ...(newsSignals.value ?? []),
    ].filter(s => s?.jellyScore >= this._minScore);

    const result = {
      ok: true,
      signals: signals.length,
      topSignals: signals.sort((a, b) => b.jellyScore - a.jellyScore).slice(0, 10),
      ts: Date.now(),
    };

    if (memory) {
      await memory.set('lastSignals', result);
      memory.history.push({ type: 'signal_hunt', count: signals.length });
    }

    signals.forEach(s => bus.signal({ source: 'signal-hunter', ...s }));
    audit.signal({ count: signals.length, top: result.topSignals[0] ?? null });

    t.end({ agent: 'signal-hunter' });
    return result;
  }

  async _scanDefiData() {
    try {
      const cacheKey = 'defi:protocols';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const r = await httpJson(`${LLAMA_TVL}/protocols`);
      if (!r.ok || !Array.isArray(r.data)) return [];

      const protocols = r.data.slice(0, 50);
      const signals = [];

      for (const p of protocols) {
        const changePct = p.change_1d ?? 0;
        if (Math.abs(changePct) < 15) continue;

        const thr = await this._thrTrigger.evaluate({
          tvlChangePct: changePct,
          volumeMultiplier: 1,
        }, { protocol: p.name, chain: p.chain });

        if (thr?.prediction) signals.push({ ...thr.prediction, source: 'defi', protocol: p.name });
      }

      cache.set(cacheKey, signals);
      return signals;
    } catch {
      return [];
    }
  }

  async _scanKeywords(texts) {
    if (!texts.length) return [];
    const results = await this._kwTrigger.scan(texts);
    return results.filter(Boolean).map(r => ({ ...r, source: 'keyword' }));
  }

  async huntProtocol(protocol, chain) {
    const text = `${protocol} ${chain} defi protocol tvl volume`;
    return this._kwTrigger.evaluate(text, { protocol, chain });
  }
}

export default SignalHunterAgent;
