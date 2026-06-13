import { metrics }      from '../core/metrics.mjs';
import { audit }        from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('risk-pulse');

export class RiskPulseAgent {
  constructor(opts = {}) {
    this._interval = opts.interval ?? 300000;
    this._active = false;
    this._checks = 0;
    this._alerts = 0;
  }

  async execute(input, memory) {
    const t = metrics.startTimer('risk-pulse.execute');
    metrics.incMetric('risk_pulse.calls');

    const { action } = input;

    switch (action) {
      case 'start':
        return this.start(memory);
      case 'stop':
        return this.stop();
      case 'pulse':
        return this.runPulse(memory);
      case 'status':
        return this.status();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async start(memory) {
    this._active = true;
    this._startTime = Date.now();

    log.info('RiskPulseAgent: monitoring started');
    audit.write({ type: 'risk_pulse_start' });

    if (memory) {
      await memory.set('riskPulse', { status: 'active', started: this._startTime });
    }
    return { status: 'active', interval: this._interval };
  }

  async stop() {
    this._active = false;
    log.info('RiskPulseAgent: monitoring stopped');
    return { status: 'stopped', checks: this._checks, alerts: this._alerts };
  }

  status() {
    return {
      active: this._active,
      checks: this._checks,
      alerts: this._alerts,
      uptime: this._active ? Date.now() - (this._startTime || 0) : 0,
    };
  }

  async runPulse(memory) {
    this._checks++;
    const now = Date.now();

    const pulse = {
      ts: now,
      market: this._assessMarket(),
      portfolio: this._assessPortfolio(),
      alerts: [],
    };

    if (pulse.market.risk > 0.7) {
      pulse.alerts.push({ level: 'high', msg: 'Market risk elevated' });
      this._alerts++;
    }

    if (pulse.portfolio.drift > 0.15) {
      pulse.alerts.push({ level: 'medium', msg: 'Portfolio drift detected' });
      this._alerts++;
    }

    audit.riskPulse(pulse);

    if (memory) {
      await memory.set('lastPulse', pulse);
      memory.history.push({ type: 'risk_pulse', ...pulse });
    }

    return pulse;
  }

  _assessMarket() {
    return { risk: Math.random() * 0.5, trend: Math.random() > 0.5 ? 'bull' : 'bear' };
  }

  _assessPortfolio() {
    return { drift: Math.random() * 0.3, exposure: Math.random() };
  }
}

export default RiskPulseAgent;