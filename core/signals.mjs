import { createLogger } from './logger.mjs';
import { bus } from './events.mjs';
import { predict } from './prediction.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THRESHOLDS = JSON.parse(readFileSync(join(__dirname, '../config/thresholds.json'), 'utf8'));
const KEYWORDS   = JSON.parse(readFileSync(join(__dirname, '../config/keywords.json'), 'utf8'));

const log = createLogger('signals');

export class KeywordTrigger {
  constructor(opts = {}) {
    this._keywords = opts.keywords ?? [...KEYWORDS.bullish, ...KEYWORDS.bearish, ...KEYWORDS.highPriority];
    this._chains   = opts.chains   ?? ['solana', 'bnb', 'polygon'];
    this._minScore = opts.minScore ?? 60;
  }

  async evaluate(text, context = {}) {
    const lower = text.toLowerCase();
    const matched = this._keywords.filter(kw => lower.includes(kw));
    if (matched.length === 0) return null;

    log.info('KeywordTrigger fired', { matched, context });
    const result = await predict({ text, ...context });

    if (result.jellyScore >= this._minScore) {
      bus.signal({ type: 'keyword', keywords: matched, prediction: result, context });
    }
    return result;
  }

  scan(texts, context = {}) {
    return Promise.all(texts.map(t => this.evaluate(t, context)));
  }
}

export class ThresholdTrigger {
  constructor(opts = {}) {
    this._volumeMultiplier = opts.volumeMultiplier ?? THRESHOLDS.volume.spikeMultiplier;
    this._tvlShockPct      = opts.tvlShockPct      ?? THRESHOLDS.tvl.shockPct;
    this._priceMovePct     = opts.priceMovePct     ?? THRESHOLDS.price.movementAlertPct;
  }

  async evaluate(data, context = {}) {
    const triggers = [];

    if (data.volumeMultiplier >= this._volumeMultiplier) {
      triggers.push({ type: 'volume_spike', value: data.volumeMultiplier, threshold: this._volumeMultiplier });
    }
    if (data.tvlChangePct != null && Math.abs(data.tvlChangePct) >= this._tvlShockPct) {
      triggers.push({ type: 'tvl_shock', value: data.tvlChangePct, threshold: this._tvlShockPct });
    }
    if (data.priceChangePct != null && Math.abs(data.priceChangePct) >= this._priceMovePct) {
      triggers.push({ type: 'price_move', value: data.priceChangePct, threshold: this._priceMovePct });
    }

    if (triggers.length === 0) return null;

    const text = triggers.map(t => t.type.replace('_', ' ')).join(' ');
    const prediction = await predict({ text, ...data, ...context });

    const result = { triggers, prediction, context, ts: Date.now() };
    bus.signal({ type: 'threshold', ...result });
    log.info('ThresholdTrigger fired', result);
    return result;
  }
}

export class EventTrigger {
  constructor(opts = {}) {
    this._events = new Map();
    this._once   = opts.once ?? false;
  }

  register(eventName, handler) {
    if (!this._events.has(eventName)) this._events.set(eventName, []);
    this._events.get(eventName).push(handler);
    return () => {
      const arr = this._events.get(eventName) ?? [];
      const idx = arr.indexOf(handler);
      if (idx >= 0) arr.splice(idx, 1);
    };
  }

  async fire(eventName, payload = {}) {
    const handlers = this._events.get(eventName) ?? [];
    const results  = await Promise.allSettled(handlers.map(h => h(payload)));
    bus.signal({ type: 'event', event: eventName, payload, results: results.length });
    log.info('EventTrigger fired', { event: eventName, handlers: handlers.length });
    return results;
  }

  listEvents() {
    return [...this._events.keys()];
  }
}

let _keyword   = null;
let _threshold = null;
let _event     = null;

export function getKeywordTrigger(opts)   { if (!_keyword)   _keyword   = new KeywordTrigger(opts);   return _keyword; }
export function getThresholdTrigger(opts) { if (!_threshold) _threshold = new ThresholdTrigger(opts); return _threshold; }
export function getEventTrigger(opts)     { if (!_event)     _event     = new EventTrigger(opts);     return _event; }

export default { KeywordTrigger, ThresholdTrigger, EventTrigger, getKeywordTrigger, getThresholdTrigger, getEventTrigger };
