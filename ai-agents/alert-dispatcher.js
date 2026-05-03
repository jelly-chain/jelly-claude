import { speak }       from '../core/voice.mjs';
import { metrics }     from '../core/metrics.mjs';
import { audit }       from '../core/audit.mjs';
import { bus }         from '../core/events.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('alert-dispatcher');

const SEVERITY_LEVELS = { low: 0, medium: 1, high: 2, critical: 3 };

export class AlertDispatcherAgent {
  constructor(opts = {}) {
    this._minSeverity = opts.minSeverity ?? 'medium';
    this._voiceEnabled = opts.voice ?? false;
    this._handlers = [];
    this._dispatched = 0;
    this._suppressed = 0;
    this._dedup = new Map();
    this._dedupWindowMs = opts.dedupWindowMs ?? 60_000;

    bus.onAlert(a => this._handle(a));
    bus.onAnomaly(a => this._handle({ severity: a.severity ?? 'medium', ...a }));
  }

  addHandler(fn) {
    this._handlers.push(fn);
    return () => { const i = this._handlers.indexOf(fn); if (i >= 0) this._handlers.splice(i, 1); };
  }

  async execute(alert, memory) {
    return this._handle(alert, memory);
  }

  async _handle(alert, memory) {
    const sevLevel = SEVERITY_LEVELS[alert.severity] ?? 0;
    const minLevel = SEVERITY_LEVELS[this._minSeverity] ?? 1;

    if (sevLevel < minLevel) { this._suppressed++; return null; }

    const dedupKey = `${alert.type}:${alert.protocol ?? alert.token ?? alert.market ?? ''}`;
    const lastSeen = this._dedup.get(dedupKey);
    if (lastSeen && Date.now() - lastSeen < this._dedupWindowMs) {
      this._suppressed++;
      return null;
    }
    this._dedup.set(dedupKey, Date.now());

    this._dispatched++;
    metrics.incMetric('alerts.dispatched');
    audit.write({ type: 'alert_dispatched', alert });
    log.warn('AlertDispatcher', { type: alert.type, severity: alert.severity });

    const message = this._format(alert);

    await Promise.allSettled([
      this._voiceEnabled && alert.severity !== 'low'
        ? speak(message.slice(0, 300)).catch(() => {})
        : Promise.resolve(),
      ...this._handlers.map(h => Promise.resolve(h(alert, message)).catch(e =>
        log.error('Alert handler error', { err: e.message })
      )),
    ]);

    if (memory) memory.history.push({ type: 'alert', severity: alert.severity, alertType: alert.type });

    return { ok: true, dispatched: true, message };
  }

  _format(alert) {
    const typeMap = {
      volume_spike:   `Volume spike on ${alert.token ?? alert.protocol ?? 'unknown'}: ${alert.multiplier}x normal`,
      tvl_shock:      `TVL ${alert.direction} on ${alert.protocol}: ${alert.changePct}%`,
      bridge_anomaly: `Bridge anomaly on ${alert.bridge}: $${alert.amountUsd?.toLocaleString()} (${alert.multiplier}x avg)`,
      price_move:     `Price ${alert.direction} on ${alert.token}: ${alert.changePct}%`,
      arbitrage:      `Arbitrage opportunity: ${alert.opportunities} markets`,
      signal:         `Signal detected: ${alert.signal ?? alert.type} (Jelly Score ${alert.jellyScore ?? 'n/a'})`,
    };
    return typeMap[alert.type] ?? `Alert: ${alert.type} — severity ${alert.severity}`;
  }

  stats() {
    return { dispatched: this._dispatched, suppressed: this._suppressed, handlers: this._handlers.length };
  }
}

export default AlertDispatcherAgent;
