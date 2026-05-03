import { createLogger } from './logger.mjs';

const log = createLogger('metrics');

class MetricsCollector {
  constructor() {
    this._counters   = new Map();
    this._gauges     = new Map();
    this._histograms = new Map();
    this._timers     = new Map();
    this._startedAt  = Date.now();
  }

  incMetric(name, delta = 1, labels = {}) {
    const key = this._key(name, labels);
    this._counters.set(key, (this._counters.get(key) ?? 0) + delta);
  }

  setGauge(name, value, labels = {}) {
    const key = this._key(name, labels);
    this._gauges.set(key, value);
  }

  observe(name, value, labels = {}) {
    const key = this._key(name, labels);
    if (!this._histograms.has(key)) this._histograms.set(key, []);
    this._histograms.get(key).push({ value, ts: Date.now() });
  }

  startTimer(name) {
    const start = Date.now();
    return {
      end: (labels = {}) => {
        const ms = Date.now() - start;
        this.observe(`${name}_ms`, ms, labels);
        return ms;
      },
    };
  }

  time(name, fn) {
    const t = this.startTimer(name);
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.finally(() => t.end());
    }
    t.end();
    return result;
  }

  getCounter(name, labels = {}) { return this._counters.get(this._key(name, labels)) ?? 0; }
  getGauge(name, labels = {})   { return this._gauges.get(this._key(name, labels));         }

  histogramSummary(name) {
    const all = [];
    for (const [k, vals] of this._histograms) {
      if (!k.startsWith(name)) continue;
      all.push(...vals.map(v => v.value));
    }
    if (all.length === 0) return null;
    all.sort((a, b) => a - b);
    return {
      count: all.length,
      min:   all[0],
      max:   all[all.length - 1],
      avg:   all.reduce((s, v) => s + v, 0) / all.length,
      p50:   all[Math.floor(all.length * 0.5)],
      p95:   all[Math.floor(all.length * 0.95)],
      p99:   all[Math.floor(all.length * 0.99)],
    };
  }

  dump() {
    const counters = Object.fromEntries(this._counters);
    const gauges   = Object.fromEntries(this._gauges);
    const histKeys = [...new Set([...this._histograms.keys()].map(k => k.split('{')[0]))];
    const hists    = Object.fromEntries(histKeys.map(k => [k, this.histogramSummary(k)]));
    return {
      uptimeMs: Date.now() - this._startedAt,
      counters,
      gauges,
      histograms: hists,
    };
  }

  reset() {
    this._counters.clear();
    this._gauges.clear();
    this._histograms.clear();
  }

  _key(name, labels) {
    const parts = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',');
    return parts ? `${name}{${parts}}` : name;
  }
}

export const metrics = new MetricsCollector();

export function incMetric(name, delta = 1, labels = {}) {
  metrics.incMetric(name, delta, labels);
}

export function setGauge(name, value, labels = {}) {
  metrics.setGauge(name, value, labels);
}

export function observe(name, value, labels = {}) {
  metrics.observe(name, value, labels);
}

export function startTimer(name) {
  return metrics.startTimer(name);
}

export default { metrics, incMetric, setGauge, observe, startTimer };
