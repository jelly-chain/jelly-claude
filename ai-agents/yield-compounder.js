// YieldCompounderAgent - Automated yield compounding and harvesting
// DeFiLlama-powered APY comparison before compounding

import { metrics }       from '../core/metrics.mjs';
import { audit }         from '../core/audit.mjs';
import { createLogger }  from '../core/logger.mjs';
import { bus }           from '../core/events.mjs';
import { getCache }      from '../core/cache.mjs';
import { getBreaker }    from '../core/circuit-breaker.mjs';
import { getRiskAssessor } from '../core/risk.mjs';
import { getTopYields }  from '../core/macro-feed.mjs';

const log = createLogger('yield-compounder-agent');
const cache = getCache('yield', { defaultTtlMs: 30_000 });
const breaker = getBreaker('yield-apis', { threshold: 5, timeoutMs: 60_000 });

const DEFAULT_PROTOCOLS = ['aave', 'compound', 'venus', 'morpho'];
const MAX_PROTOCOLS = 10;
const MAX_HISTORY = 200;

export class YieldCompounderAgent {
  constructor(opts = {}) {
    this._protocols = opts.protocols ?? DEFAULT_PROTOCOLS;
    this._minReward = opts.minReward ?? 10;
    this._autoCompound = opts.autoCompound ?? false;
    this._riskProfile = opts.riskProfile ?? 'balanced';
    this._riskAssessor = getRiskAssessor({ profile: this._riskProfile });
    this._history = [];
    this._callCount = 0;
    this._lastCheck = null;
    this._active = false;
    this._compoundController = null;
  }

  async execute(input = {}, memory) {
    const t = metrics.startTimer('yield-compounder.execute');
    metrics.incMetric('yield_compounder.calls');
    this._callCount++;

    const action = input.action ?? 'check';

    try {
      let result;
      switch (action) {
        case 'check':
          result = await this._handleCheck(input, memory);
          break;
        case 'compound':
          result = await this._handleCompound(input, memory);
          break;
        case 'harvest':
          result = await this._handleHarvest(input, memory);
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
        case 'protocols':
          result = await this._handleProtocols(input, memory);
          break;
        case 'addProtocol':
          result = await this._handleAddProtocol(input, memory);
          break;
        case 'removeProtocol':
          result = await this._handleRemoveProtocol(input, memory);
          break;
        default:
          result = await this._handleCheck(input, memory);
      }

      this._lastCheck = result;
      this._addToHistory(result);

      if (memory) {
        await this._updateMemory(memory, result);
      }

      audit.yield({ action, result });
      log.info('YieldCompounder: action completed', { action, protocols: this._protocols.length });
      return result;
    } catch (err) {
      metrics.incMetric('yield_compounder.errors');
      audit.error({ agent: 'yield-compounder', error: err.message });
      throw err;
    } finally {
      t.end({ agent: 'yield-compounder', action });
    }
  }

  async _handleCheck(input, memory) {
    const positions = await this._fetchPositions(input.protocols ?? this._protocols);
    const compoundable = positions.filter(p => p.rewards >= this._minReward);

    const result = {
      ok: true,
      positions,
      compoundable: compoundable.length,
      totalRewards: compoundable.reduce((sum, p) => sum + p.rewards, 0),
      timestamp: Date.now(),
    };

    if (compoundable.length > 0) {
      bus.emit('yield-check', result);
    }

    return result;
  }

  async _handleCompound(input, memory) {
    const { protocol, amount } = input;
    if (!protocol) throw new Error('Compound requires protocol');

    const result = await this._executeCompound(protocol, amount);
    this._positions.push(result);

    return {
      ...result,
      ts: Date.now(),
    };
  }

  async _handleHarvest(input, memory) {
    const { protocol } = input;
    if (!protocol) throw new Error('Harvest requires protocol');

    const result = await this._executeHarvest(protocol);
    return {
      ...result,
      ts: Date.now(),
    };
  }

  async _handleStart(input, memory) {
    if (this._active) return { status: 'already_active' };

    this._active = true;
    this._runCompoundLoop(memory);

    return { status: 'started', interval: this._compoundInterval };
  }

  async _handleStop(input, memory) {
    this._active = false;
    if (this._compoundController) {
      clearInterval(this._compoundController);
      this._compoundController = null;
    }
    return { status: 'stopped' };
  }

  async _handleHistory(input, memory) {
    const limit = input.limit ?? 20;
    return { history: this._history.slice(-limit), count: this._history.length };
  }

  async _handleProtocols(input, memory) {
    return { protocols: this._protocols, active: this._active };
  }

  async _handleAddProtocol(input, memory) {
    const { protocol } = input;
    if (!protocol) throw new Error('Protocol required');

    if (!this._protocols.includes(protocol)) {
      this._protocols.push(protocol);
    }
    return { added: true, protocol, count: this._protocols.length };
  }

  async _handleRemoveProtocol(input, memory) {
    const { protocol } = input;
    if (!protocol) throw new Error('Protocol required');

    const index = this._protocols.indexOf(protocol);
    if (index >= 0) {
      this._protocols.splice(index, 1);
      return { removed: true, protocol, count: this._protocols.length };
    }
    return { removed: false, protocol };
  }

  async _executeCompound(protocol, amount) {
    // Simplified execution
    return {
      protocol,
      amount: amount || 'max',
      txId: `0x${Math.random().toString(16).slice(2, 66)}`,
      rewardsCompounded: Math.random() * 100,
      newBalance: Math.random() * 1000 + 1000,
      timestamp: Date.now(),
    };
  }

  async _executeHarvest(protocol) {
    return {
      protocol,
      harvested: Math.random() * 50,
      txId: `0x${Math.random().toString(16).slice(2, 66)}`,
      timestamp: Date.now(),
    };
  }

  _runCompoundLoop(memory) {
    this._compoundController = setInterval(async () => {
      try {
        await this._handleCheck({}, memory);
      } catch (err) {
        log.error('Compound loop error', { error: err.message });
      }
    }, this._compoundInterval);
  }

  async _fetchPositions(protocols) {
    // Fetch real APY data from DeFiLlama for each protocol
    const allPools = await getTopYields({ minTvl: 100_000, minApy: 0.1, limit: 200 }).catch(() => []);
    const positions = [];
    for (const protocol of protocols) {
      try {
        const matches = allPools.filter(p =>
          p.project?.toLowerCase().includes(protocol.toLowerCase()) ||
          protocol.toLowerCase().includes(p.project?.toLowerCase() ?? '')
        );
        if (matches.length > 0) {
          const best = matches.sort((a, b) => b.apy - a.apy)[0];
          // Gas-adjusted APY: subtract estimated gas costs from gross APY
          // Gas costs per chain (rough estimates in USD per transaction)
          const gasCostPerTx = {
            ethereum: 5.00,
            bnb: 0.10,
            base: 0.05,
            polygon: 0.01,
            arbitrum: 0.10,
            solana: 0.001,
          };
          const chainKey = (best.chain ?? 'ethereum').toLowerCase();
          const gasCost = gasCostPerTx[chainKey] ?? 1.00;
          const harvestsPerYear = 52; // weekly compounding
          const positionValue = best.tvlUsd > 0 ? Math.min(best.tvlUsd, 10000) : 1000;
          const annualGasCost = gasCost * harvestsPerYear;
          const gasAdjustedApy = best.apy - (annualGasCost / positionValue * 100);

          positions.push({
            protocol,
            pool:     best.pool,
            symbol:   best.symbol,
            chain:    best.chain,
            supplied: 0,  // actual positions require wallet connection
            rewards:  0,  // requires on-chain read
            apy:      best.apy,
            gasAdjustedApy: parseFloat(gasAdjustedApy.toFixed(2)),
            estimatedGasPerHarvest: gasCost,
            tvlUsd:   best.tvlUsd,
            source:   'defillama',
          });
        } else {
          // Protocol not in DeFiLlama — include with null APY
          positions.push({ protocol, supplied: 0, rewards: 0, apy: null, source: 'not_found' });
        }
      } catch (err) {
        log.warn('YieldCompounder: fetch failed for protocol', { protocol, error: err.message });
      }
    }
    return positions;
  }

  async _updateMemory(memory, result) {
    if (memory) {
      await memory.set('lastYieldCheck', result);
      memory.history.push({ type: 'yield', ...result });
    }
  }

  _addToHistory(item) {
    this._history.push(item);
    if (this._history.length > MAX_HISTORY) this._history.shift();
  }

  getStats() {
    return {
      callCount: this._callCount,
      active: this._active,
      protocols: this._protocols,
      historySize: this._history.length,
    };
  }
}

export default YieldCompounderAgent;