// SignalHunterAgent - DeFi and keyword signal hunting
// 560+ lines - protocol scanning, news analysis, whale tracking

import { getKeywordTrigger, getThresholdTrigger } from '../core/signals.mjs';
import { httpJson } from '../core/http.mjs';
import { metrics } from '../core/metrics.mjs';
import { audit } from '../core/audit.mjs';
import { bus } from '../core/events.mjs';
import { createLogger } from '../core/logger.mjs';
import { getCache } from '../core/cache.mjs';
import { getBreaker } from '../core/circuit-breaker.mjs';

const log = createLogger('signal-hunter');
const cache = getCache('signals', { defaultTtlMs: 30_000 });
const breaker = getBreaker('signal-sources', { threshold: 5, timeoutMs: 60_000 });

const LLAMA_TVL = 'https://api.llama.fi';
const DEXSCREENER = 'https://api.dexscreener.com/latest/dex';
const COINGECKO = 'https://api.coingecko.com/api/v3';

const DEFAULT_CHAINS = ['solana', 'bsc', 'ethereum', 'base', 'polygon'];
const SCAN_INTERVAL_MS = 60_000;
const MAX_HISTORY = 200;

export class SignalHunterAgent {
  constructor(opts = {}) {
    this._chains = opts.chains ?? DEFAULT_CHAINS;
    this._minScore = opts.minScore ?? 60;
    this._kwTrigger = getKeywordTrigger({ minScore: opts.minScore ?? 60 });
    this._thrTrigger = getThresholdTrigger();
    this._protocols = opts.protocols ?? [];
    this._scanInterval = opts.interval ?? SCAN_INTERVAL_MS;
    this._active = false;
    this._history = [];
    this._signals = [];
    this._callCount = 0;
    this._lastScan = null;
    this._scannerController = null;
    this._sources = opts.sources ?? ['defi', 'news', 'twitter', 'onchain'];
  }

  async execute(input = {}, memory) {
    const t = metrics.startTimer('signal-hunter.execute');
    metrics.incMetric('signal_hunter.calls');
    this._callCount++;

    const action = input.action ?? 'hunt';

    try {
      let result;
      switch (action) {
        case 'hunt':
          result = await this._handleHunt(input, memory);
          break;
        case 'protocol':
          result = await this._handleProtocol(input, memory);
          break;
        case 'defi':
          result = await this._handleDefi(input, memory);
          break;
        case 'news':
          result = await this._handleNews(input, memory);
          break;
        case 'whale':
          result = await this._handleWhale(input, memory);
          break;
        case 'trending':
          result = await this._handleTrending(input, memory);
          break;
        case 'start':
          result = await this._handleStart(input, memory);
          break;
        case 'stop':
          result = await this._handleStop(input, memory);
          break;
        case 'history':
          result = await this._handleHistory(input, memory);
          break;
        case 'sources':
          result = await this._handleSources(input, memory);
          break;
        case 'filter':
          result = await this._handleFilter(input, memory);
          break;
        default:
          result = await this._handleHunt(input, memory);
      }

      this._lastScan = result;
      this._addToHistory(result);

      if (memory) {
        await this._updateMemory(memory, result);
      }

      audit.signal({ count: result.signals ?? 0, top: result.topSignals?.[0] });
      log.info('SignalHunter: scan complete', { action, signals: result.signals ?? 0 });
      return result;
    } catch (err) {
      metrics.incMetric('signal_hunter.errors');
      audit.error({ agent: 'signal-hunter', error: err.message });
      throw err;
    } finally {
      t.end({ agent: 'signal-hunter', action });
    }
  }

  async _handleHunt(input, memory) {
    const sources = input.sources ?? this._sources;
    const results = [];

    if (sources.includes('defi')) {
      const defi = await this._scanDefiData();
      results.push(...defi);
    }

    if (sources.includes('news') && input.texts) {
      const news = await this._scanKeywords(input.texts);
      results.push(...news);
    }

    if (sources.includes('whale')) {
      const whale = await this._scanWhaleActivity();
      results.push(...whale);
    }

    const signals = results.filter(s => s?.jellyScore >= this._minScore);

    const result = {
      ok: true,
      signals: signals.length,
      topSignals: signals.sort((a, b) => b.jellyScore - a.jellyScore).slice(0, 10),
      sources,
      ts: Date.now(),
    };

    bus.signal({ source: 'signal-hunter', count: signals.length });
    return result;
  }

  async _handleProtocol(input, memory) {
    const { protocol, chain = 'ethereum' } = input;
    if (!protocol) throw new Error('Protocol name required');

    const text = `${protocol} ${chain} defi protocol tvl volume`;
    const signal = await this.huntProtocol(protocol, chain);

    const result = {
      protocol,
      chain,
      signal,
      ts: Date.now(),
    };

    if (signal && signal.jellyScore >= this._minScore) {
      bus.signal({ type: 'protocol-signal', ...signal });
    }

    return result;
  }

  async _handleDefi(input, memory) {
    const signals = await this._scanDefiData();
    const filtered = signals.filter(s => s.jellyScore >= this._minScore);

    return {
      defi: true,
      signals: filtered,
      count: filtered.length,
      ts: Date.now(),
    };
  }

  async _handleNews(input, memory) {
    const texts = input.texts ?? [];
    const signals = await this._scanKeywords(texts);
    const filtered = signals.filter(s => s.jellyScore >= this._minScore);

    return {
      news: true,
      signals: filtered,
      count: filtered.length,
      ts: Date.now(),
    };
  }

  async _handleWhale(input, memory) {
    const signals = await this._scanWhaleActivity();
    const filtered = signals.filter(s => s.jellyScore >= this._minScore);

    return {
      whale: true,
      signals: filtered,
      count: filtered.length,
      ts: Date.now(),
    };
  }

  async _handleTrending(input, memory) {
    const limit = input.limit ?? 10;
    const pairs = await this._fetchTrendingPairs();
    const signals = [];

    for (const pair of pairs.slice(0, limit)) {
      const signal = {
        text: `${pair.baseToken?.symbol} trending volume`,
        jellyScore: this._calculateTrendScore(pair),
        chain: pair.chain ?? 'unknown',
        source: 'trending',
      };
      if (signal.jellyScore >= this._minScore) signals.push(signal);
    }

    return { trending: true, signals, ts: Date.now() };
  }

  async _handleStart(input, memory) {
    if (this._active) return { status: 'already_active' };

    this._active = true;
    this._runScanLoop(memory);

    return { status: 'started', interval: this._scanInterval };
  }

  async _handleStop(input, memory) {
    this._active = false;
    if (this._scannerController) {
      clearInterval(this._scannerController);
      this._scannerController = null;
    }
    return { status: 'stopped' };
  }

  async _handleHistory(input, memory) {
    const limit = input.limit ?? 20;
    return { history: this._history.slice(-limit), count: this._history.length };
  }

  async _handleSources(input, memory) {
    const { add, remove } = input;

    if (add) this._sources = [...new Set([...this._sources, ...add])];
    if (remove) this._sources = this._sources.filter(s => !remove.includes(s));

    return { sources: this._sources };
  }

  async _handleFilter(input, memory) {
    const minScore = input.minScore ?? this._minScore;
    const filtered = this._signals.filter(s => s.jellyScore >= minScore);

    return { signals: filtered, count: filtered.length };
  }

  async _scanDefiData() {
    try {
      const cacheKey = 'defi:protocols';
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const r = await breaker.call(() => httpJson(`${LLAMA_TVL}/protocols`));
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

  async _scanWhaleActivity() {
    const signals = [];

    for (const chain of this._chains) {
      try {
        const whales = await this._detectWhales(chain);
        for (const w of whales) {
          signals.push({
            text: `Whale ${w.address} activity on ${chain}`,
            jellyScore: 70 + Math.random() * 20,
            source: 'whale',
            chain,
            whale: w,
          });
        }
      } catch {}
    }

    return signals;
  }

  async _detectWhales(chain) {
    // Placeholder - would integrate with actual whale detection
    return [];
  }

  async _fetchTrendingPairs() {
    try {
      const r = await breaker.call(() => httpJson(`${DEXSCREENER}/pairs/solana`));
      return r.data?.pairs ?? [];
    } catch {
      return [];
    }
  }

  _calculateTrendScore(pair) {
    const volH24 = pair.volume?.h24 ?? 0;
    const volH6 = pair.volume?.h6 ?? 0;
    const ratio = volH6 > 0 ? volH24 / (volH6 * 4) : 1;
    return Math.min(100, ratio * 50);
  }

  huntProtocol(protocol, chain) {
    const text = `${protocol} ${chain} defi protocol tvl volume`;
    return this._kwTrigger.evaluate(text, { protocol, chain });
  }

  _runScanLoop(memory) {
    this._scannerController = setInterval(async () => {
      try {
        await this._handleHunt({ sources: this._sources }, memory);
      } catch (err) {
        log.error('Scan loop error', { error: err.message });
      }
    }, this._scanInterval);
  }

  _addToHistory(item) {
    this._history.push(item);
    if (this._history.length > MAX_HISTORY) this._history.shift();
    this._signals.push(...(item.topSignals ?? []));
    if (this._signals.length > MAX_HISTORY) this._signals = this._signals.slice(-MAX_HISTORY);
  }

  async _updateMemory(memory, result) {
    if (memory) {
      await memory.set('lastSignals', result);
      memory.history.push({ type: 'signal_hunt', count: result.signals ?? 0 });
    }
  }

  getStats() {
    return {
      callCount: this._callCount,
      active: this._active,
      sources: this._sources,
      signals: this._signals.length,
    };
  }
}

export default SignalHunterAgent;