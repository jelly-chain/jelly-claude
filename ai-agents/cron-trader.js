import { executeTrade } from '../core/trade.mjs';
import { metrics }      from '../core/metrics.mjs';
import { audit }        from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('cron-trader');

export class CronTraderAgent {
  constructor(opts = {}) {
    this._profile = opts.profile ?? 'balanced';
    this._schedule = opts.schedule ?? [];
    this._active = false;
    this._trades = 0;
  }

  async execute(input, memory) {
    const t = metrics.startTimer('cron-trader.execute');
    metrics.incMetric('cron_trader.calls');

    const { action, ...rest } = input;

    switch (action) {
      case 'start':
        return this.start(input, memory);
      case 'stop':
        return this.stop();
      case 'status':
        return this.status();
      case 'trade':
        return this.makeTrade(input, memory);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async start(input, memory) {
    this._active = true;
    log.info('CronTraderAgent: started', { profile: this._profile, schedule: this._schedule });
    audit.write({ type: 'cron_trader_start', profile: this._profile });

    if (memory) {
      await memory.set('cronTrader', { status: 'active', profile: this._profile, started: Date.now() });
    }
    return { status: 'active', profile: this._profile };
  }

  async stop() {
    this._active = false;
    log.info('CronTraderAgent: stopped');
    return { status: 'stopped', trades: this._trades };
  }

  status() {
    return { active: this._active, trades: this._trades, profile: this._profile };
  }

  async makeTrade(input, memory) {
    const trade = await executeTrade(input);
    this._trades++;

    if (memory) {
      await memory.set('lastTrade', trade);
      memory.history.push({ type: 'trade', ...trade });
    }

    audit.trade({ input, result: trade });
    log.info('CronTraderAgent: trade executed', { tx: trade.tx, status: trade.status });
    return trade;
  }

  async setupCron(schedule) {
    this._schedule = schedule;
    log.info('CronTraderAgent: cron configured', { schedule });
    return { schedule, configured: true };
  }
}

export default CronTraderAgent;