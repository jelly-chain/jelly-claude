import { httpJson }    from '../core/http.mjs';
import { metrics }     from '../core/metrics.mjs';
import { audit }       from '../core/audit.mjs';
import { bus }         from '../core/events.mjs';
import { createLogger } from '../core/logger.mjs';
import { getCache }    from '../core/cache.mjs';
import { getBreaker }  from '../core/circuit-breaker.mjs';

const log     = createLogger('monitor-agent');
const cache   = getCache('monitor', { defaultTtlMs: 60_000 });
const breaker = getBreaker('monitor-apis', { threshold: 5 });

export class MonitorAgent {
  constructor(opts = {}) {
    this._wallets    = opts.wallets   ?? [];
    this._thresholds = opts.thresholds ?? {};
    this._chains     = opts.chains    ?? ['solana', 'bnb'];
    this._interval   = null;
    this._callbacks  = [];
  }

  addWallet(address, chain, label) {
    this._wallets.push({ address, chain, label: label ?? address.slice(0, 8) });
    log.info('MonitorAgent: watching wallet', { address, chain });
    return this;
  }

  onAlert(fn) { this._callbacks.push(fn); return this; }

  _emit(alert) {
    bus.alert(alert);
    audit.write({ type: 'monitor_alert', ...alert });
    this._callbacks.forEach(fn => fn(alert));
  }

  async execute(input = {}, memory) {
    const t = metrics.startTimer('monitor.execute');
    metrics.incMetric('monitor.calls');

    const wallets = input.wallets ?? this._wallets;
    const results = await Promise.allSettled(wallets.map(w => this._checkWallet(w)));

    const alerts = results
      .filter(r => r.status === 'fulfilled' && r.value?.alert)
      .map(r => r.value);

    alerts.forEach(a => this._emit(a));

    const result = {
      ok: true, checked: wallets.length, alerts: alerts.length,
      results: results.map((r, i) => ({
        wallet: wallets[i],
        status: r.status,
        data:   r.value ?? null,
        error:  r.reason?.message ?? null,
      })),
      ts: Date.now(),
    };

    if (memory) {
      await memory.set('lastMonitor', result);
      memory.history.push({ type: 'monitor', checked: wallets.length, alerts: alerts.length });
    }

    t.end({ agent: 'monitor' });
    return result;
  }

  async _checkWallet(w) {
    const cacheKey = `wallet:${w.chain}:${w.address}`;
    const prev = cache.get(cacheKey);

    const current = await breaker.call(() => this._fetchBalance(w));
    cache.set(cacheKey, current);

    if (!prev || !current) return { wallet: w, alert: false };

    const changePct = prev.totalUsd > 0
      ? ((current.totalUsd - prev.totalUsd) / prev.totalUsd) * 100
      : 0;

    const threshold = this._thresholds[w.chain] ?? 10;
    const alert = Math.abs(changePct) >= threshold;

    return {
      wallet: w, alert, changePct: parseFloat(changePct.toFixed(2)),
      previousUsd: prev.totalUsd, currentUsd: current.totalUsd,
      type: changePct < 0 ? 'outflow' : 'inflow',
    };
  }

  async _fetchBalance(w) {
    try {
      if (w.chain === 'solana') {
        const r = await httpJson(`https://api.mainnet-beta.solana.com`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [w.address] }),
        });
        const lamports = r.data?.result?.value ?? 0;
        return { totalUsd: lamports / 1e9, native: lamports / 1e9, chain: 'solana' };
      }
      return { totalUsd: 0, native: 0, chain: w.chain };
    } catch {
      return null;
    }
  }

  startPolling(intervalMs = 60_000) {
    this._interval = setInterval(() => this.execute(), intervalMs);
    log.info('MonitorAgent: polling started', { intervalMs, wallets: this._wallets.length });
    return () => this.stopPolling();
  }

  stopPolling() {
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
  }
}

export default MonitorAgent;
