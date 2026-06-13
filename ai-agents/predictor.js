// PredictorAgent - Advanced market prediction engine with Jelly Score
// Part of the Jelly-Claude AI agent ecosystem - 550+ lines
// Handles single/multi-market prediction, streaming, batch operations

import { predict } from '../core/prediction.mjs';
import { assessTrade } from '../core/risk.mjs';
import { audit } from '../core/audit.mjs';
import { metrics } from '../core/metrics.mjs';
import { createLogger } from '../core/logger.mjs';
import { bus } from '../core/events.mjs';
import { getCache } from '../core/cache.mjs';
import { getBreaker } from '../core/circuit-breaker.mjs';

const log = createLogger('predictor-agent');
const cache = getCache('predictor', { defaultTtlMs: 60_000 });
const breaker = getBreaker('prediction-engine', { threshold: 5, timeoutMs: 120_000 });

// Configuration constants
const DEFAULT_CHAINS = ['solana', 'bnb', 'polygon', 'base', 'ethereum'];
const DEFAULT_PROFILES = ['conservative', 'balanced', 'aggressive', 'sniper', 'hodl', 'scalper', 'swing'];
const STREAM_INTERVAL_MS = 5000;
const BATCH_SIZE = 10;
const MAX_HISTORY = 500;

// Market types for specialized handling
const MARKET_TYPES = {
  CRYPTO: 'crypto',
  PREDICTION: 'prediction',
  FOREX: 'forex',
  COMMODITY: 'commodity',
  EQUITY: 'equity',
  BINARY: 'binary',
};

export class PredictorAgent {
  constructor(opts = {}) {
    this._chains = opts.chains ?? DEFAULT_CHAINS;
    this._profile = opts.profile ?? 'balanced';
    this._marketType = opts.marketType ?? MARKET_TYPES.PREDICTION;
    this._batchSize = opts.batchSize ?? BATCH_SIZE;
    this._history = [];
    this._predictions = new Map();
    this._streaming = false;
    this._streamController = null;
    this._enhancementRules = opts.enhancementRules ?? this._defaultEnhancementRules();
    this._confidenceThreshold = opts.confidenceThreshold ?? 0.5;
    this._signalWeights = opts.signalWeights ?? this._defaultWeights();
    this._callCount = 0;
    this._lastPrediction = null;
  }

  _defaultEnhancementRules() {
    return {
      volume: { weight: 0.3, minThreshold: 1.5 },
      sentiment: { weight: 0.2, minConfidence: 0.6 },
      technical: { weight: 0.25, indicator: 'rsi' },
      onchain: { weight: 0.25, metric: 'tvl' },
    };
  }

  _defaultWeights() {
    return {
      technical: 0.4,
      sentiment: 0.2,
      volume: 0.2,
      onchain: 0.2,
    };
  }

  /**
   * Main execution method - routes to appropriate handler
   */
  async execute(input = {}, memory) {
    const t = metrics.startTimer('predictor.execute');
    metrics.incMetric('predictor.calls');
    this._callCount++;

    // Validate input
    if (!input || (typeof input !== 'object')) {
      throw new Error('PredictorAgent requires valid input object');
    }

    const action = input.action ?? 'predict';

    try {
      let result;
      switch (action) {
        case 'predict':
          result = await this._handlePredict(input, memory);
          break;
        case 'batch':
          result = await this._handleBatch(input, memory);
          break;
        case 'stream':
          result = await this._handleStream(input, memory);
          break;
        case 'score':
          result = await this._handleScore(input, memory);
          break;
        case 'market':
          result = await this._handleMarket(input, memory);
          break;
        case 'compare':
          result = await this._handleCompare(input, memory);
          break;
        case 'backtest':
          result = await this._handleBacktest(input, memory);
          break;
        case 'history':
          result = await this._handleHistory(input, memory);
          break;
        case 'confidence':
          result = await this._handleConfidence(input, memory);
          break;
        case 'ensemble':
          result = await this._handleEnsemble(input, memory);
          break;
        default:
          result = await this._handlePredict(input, memory);
      }

      this._lastPrediction = result;
      this._addToHistory(result);

      if (memory) {
        await this._updateMemory(memory, result);
      }

      audit.prediction({ input, result, callCount: this._callCount });
      log.info('PredictorAgent: prediction completed', {
        jellyScore: result.prediction?.jellyScore,
        market: input.market,
      });
      return result;
    } catch (err) {
      metrics.incMetric('predictor.errors');
      audit.error({ agent: 'predictor', error: err.message, input });
      log.error('PredictorAgent: prediction failed', { error: err.message });
      throw err;
    } finally {
      t.end({ agent: 'predictor', action });
    }
  }

  /**
   * Default prediction handler
   */
  async _handlePredict(input, memory) {
    const prediction = await breaker.call(async () => {
      const cacheKey = `pred:${JSON.stringify(input)}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        log.debug('Cache hit for prediction', { key: cacheKey });
        return cached;
      }

      const result = await predict({
        text: input.text ?? input,
        chain: input.chain,
        market: input.market,
        ...input,
      });

      cache.set(cacheKey, result);
      return result;
    });

    const assessment = assessTrade(prediction, {
      leverage: input.leverage,
      profile: this._profile,
    });

    return {
      prediction,
      assessment,
      agent: 'predictor',
      ts: Date.now(),
      chain: input.chain,
      market: input.market,
      stream: false,
    };
  }

  /**
   * Batch prediction handler
   */
  async _handleBatch(input, memory) {
    const inputs = input.inputs ?? [input];
    if (!Array.isArray(inputs)) {
      throw new Error('Batch prediction requires array of inputs');
    }

    const results = await Promise.allSettled(
      inputs.map((item, idx) => this._handlePredict({ ...item, _batchIdx: idx }, null))
    );

    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    const failed = results
      .filter(r => r.status === 'rejected')
      .map((r, idx) => ({ index: idx, error: r.reason?.message }));

    const batchResult = {
      predictions: successful,
      count: successful.length,
      failed: failed.length,
      errors: failed,
      timestamp: Date.now(),
    };

    bus.emit('batch-predictions', batchResult);
    return batchResult;
  }

  /**
   * Streaming prediction handler
   */
  async _handleStream(input, memory) {
    if (this._streaming) {
      return { streaming: true, status: 'already_active' };
    }

    this._streaming = true;
    const results = [];

    // Create async iterator for streaming
    const self = this;
    const stream = {
      async start(controller) {
        self._streamController = controller;

        while (self._streaming) {
          try {
            const prediction = await self._handlePredict(input, null);
            results.push(prediction);

            if (memory) {
              await memory.set('lastStreamPrediction', prediction);
            }

            controller.enqueue({
              ...prediction,
              stream: true,
              accumulated: results.length,
            });

            await new Promise(resolve => setTimeout(resolve, STREAM_INTERVAL_MS));
          } catch (err) {
            controller.enqueue({ error: err.message, stream: true });
          }
        }

        controller.close();
      },
    };

    return {
      stream: true,
      iterator: stream,
      results,
      count: results.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Score markets handler
   */
  async _handleScore(input, memory) {
    const markets = input.markets ?? [];
    const results = await this.batchExecute(
      markets.map(m => ({ text: `${m.question} ${m.description ?? ''}`, market: m.id, chain: m.chain })),
      memory
    );

    const sorted = results.sort((a, b) => b.prediction.jellyScore - a.prediction.jellyScore);

    const scoring = {
      markets: sorted,
      top: sorted.slice(0, 10),
      averageScore: sorted.reduce((sum, r) => sum + r.prediction.jellyScore, 0) / sorted.length,
      timestamp: Date.now(),
    };

    bus.emit('market-scoring', scoring);
    return scoring;
  }

  /**
   * Market-specific prediction
   */
  async _handleMarket(input, memory) {
    const { marketId, platform, ...rest } = input;
    const marketPrediction = await this._handlePredict({
      market: marketId,
      ...rest,
    }, memory);

    return {
      ...marketPrediction,
      marketId,
      platform,
      specific: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Compare predictions across platforms
   */
  async _handleCompare(input, memory) {
    const platforms = input.platforms ?? ['polymarket', 'kalshi', 'predictfun'];
    const results = {};

    await Promise.all(
      platforms.map(async platform => {
        const pred = await this._handlePredict({ ...input, platform }, memory);
        results[platform] = pred;
      })
    );

    return {
      comparison: results,
      platforms,
      timestamp: Date.now(),
    };
  }

  /**
   * Backtest handler
   */
  async _handleBacktest(input, memory) {
    const scenarios = input.scenarios ?? [];
    const backtestResults = [];

    for (const scenario of scenarios) {
      const prediction = await this._handlePredict(scenario, null);
      const actualReturn = scenario.actualReturn ?? 0;
      const correct = (prediction.prediction.jellyScore > 50 && actualReturn > 0) ||
                      (prediction.prediction.jellyScore <= 50 && actualReturn <= 0);

      backtestResults.push({
        scenario,
        prediction: prediction.prediction.jellyScore,
        actual: actualReturn,
        correct,
      });
    }

    const accuracy = backtestResults.filter(r => r.correct).length / backtestResults.length;

    return {
      backtest: true,
      results: backtestResults,
      accuracy: parseFloat(accuracy.toFixed(4)),
      total: backtestResults.length,
      timestamp: Date.now(),
    };
  }

  /**
   * History handler
   */
  async _handleHistory(input, memory) {
    const limit = input.limit ?? 50;
    const recent = this._history.slice(-limit);

    return {
      history: recent,
      count: this._history.length,
      lastPrediction: this._lastPrediction,
      timestamp: Date.now(),
    };
  }

  /**
   * Confidence adjustment handler
   */
  async _handleConfidence(input, memory) {
    const base = await this._handlePredict(input, memory);
    const confidence = this._calculateConfidence(base, input);

    return {
      ...base,
      confidence,
      adjusted: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Ensemble prediction
   */
  async _handleEnsemble(input, memory) {
    const models = input.models ?? ['base', 'technical', 'sentiment'];
    const predictions = {};

    for (const model of models) {
      predictions[model] = await this._handlePredict({ ...input, model }, memory);
    }

    const ensembleScore = this._calculateEnsemble(predictions);

    return {
      ensemble: true,
      predictions,
      ensembleScore,
      models,
      timestamp: Date.now(),
    };
  }

  /**
   * Batch execute helper
   */
  async batchExecute(inputs, memory) {
    const chunks = [];
    for (let i = 0; i < inputs.length; i += this._batchSize) {
      chunks.push(inputs.slice(i, i + this._batchSize));
    }

    const results = [];
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(input => this.execute(input, memory))
      );
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Memory update helper
   */
  async _updateMemory(memory, result) {
    if (memory) {
      await memory.set('lastPrediction', result);
      memory.history.push({ type: 'prediction', ...result });
    }
  }

  /**
   * Add to history
   */
  _addToHistory(item) {
    this._history.push(item);
    if (this._history.length > MAX_HISTORY) {
      this._history.shift();
    }
  }

  /**
   * Calculate confidence score
   */
  _calculateConfidence(prediction, input) {
    let confidence = prediction.prediction.confidence ?? 0.5;

    // Adjust based on market conditions
    if (input.volume) confidence *= 1.1;
    if (input.sentiment) confidence = confidence * 0.9 + input.sentiment * 0.1;

    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Calculate ensemble score
   */
  _calculateEnsemble(predictions) {
    const scores = Object.values(predictions).map(p => p.prediction.jellyScore);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Public API methods
  setProfile(profile) {
    if (!DEFAULT_PROFILES.includes(profile)) {
      throw new Error(`Invalid profile: ${profile}`);
    }
    this._profile = profile;
    return this;
  }

  stopStreaming() {
    this._streaming = false;
    if (this._streamController) {
      this._streamController.close();
      this._streamController = null;
    }
    return { streaming: false };
  }

  getStats() {
    return {
      callCount: this._callCount,
      historySize: this._history.length,
      profile: this._profile,
      streaming: this._streaming,
    };
  }

  clearHistory() {
    this._history = [];
    return this;
  }
}

export default PredictorAgent;