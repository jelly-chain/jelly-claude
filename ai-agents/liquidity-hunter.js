import { metrics }      from '../core/metrics.mjs';
import { audit }        from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('liquidity-hunter');

export class LiquidityHunterAgent {
  constructor(opts = {}) {
    this._chains = opts.chains || ['solana', 'bnb', 'ethereum'];
    this._minTvl = opts.minTvl ?? 100000;
    this._maxIlRisk = opts.maxIlRisk ?? 0.15;
  }

  async execute(input, memory) {
    const t = metrics.startTimer('liquidity-hunter.execute');
    metrics.incMetric('liquidity_hunter.calls');

    const { action } = input;

    switch (action) {
      case 'scan':
        return this.scanPools(input.chain, memory);
      case 'evaluate':
        return this.evaluatePool(input.pool, memory);
      case 'opportunity':
        return this.findOpportunity(input.chain, memory);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async scanPools(chain, memory) {
    const pools = [
      { name: 'SOL-USDC', tvl: 2500000, apr: 45, ilRisk: 0.05, dex: 'raydium' },
      { name: 'BNB-USDT', tvl: 1800000, apr: 72, ilRisk: 0.12, dex: 'pancake' },
      { name: 'ETH-USDC', tvl: 8900000, apr: 28, ilRisk: 0.03, dex: 'uniswap' },
    ];

    const filtered = pools.filter(p => p.tvl >= this._minTvl && p.ilRisk <= this._maxIlRisk);

    const result = { chain, pools: filtered, scanned: pools.length };

    audit.liquidityScan(result);

    if (memory) {
      memory.history.push({ type: 'pool_scan', ...result });
    }

    return result;
  }

  async evaluatePool(pool, memory) {
    const evaluation = {
      pool,
      score: this._calculateScore(pool),
      ilRisk: pool.ilRisk || 0.1,
      rewards: { apr: pool.apr, daily: (pool.apr / 365) * (pool.tvl / 1000000) },
      recommendation: pool.ilRisk < 0.1 ? 'good' : 'monitor',
    };

    if (memory) {
      memory.history.push({ type: 'pool_evaluation', ...evaluation });
    }

    return evaluation;
  }

  async findOpportunity(chain, memory) {
    const scan = await this.scanPools(chain, memory);
    const best = scan.pools[0];

    const opportunity = {
      chain,
      pool: best,
      estimatedApy: ((best.apr || 0) * 0.8).toFixed(1),
      risk: 'low',
      action: 'add_liquidity',
    };

    if (memory) {
      memory.history.push({ type: 'opportunity', ...opportunity });
    }

    return opportunity;
  }

  _calculateScore(pool) {
    return (pool.apr * 0.7 - pool.ilRisk * 100 * 0.3) / 100;
  }
}

export default LiquidityHunterAgent;