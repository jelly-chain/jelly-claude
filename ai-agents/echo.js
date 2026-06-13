// EchoAgent - Advanced signal reflection and transformation engine
// Part of the Jelly-Claude AI agent ecosystem
// Lines: 520

import { metrics } from '../core/metrics.mjs';
import { audit } from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';
import { bus } from '../core/events.mjs';
import { getCache } from '../core/cache.mjs';
import { getBreaker } from '../core/circuit-breaker.mjs';

const log = createLogger('echo-agent');
const cache = getCache('echo', { defaultTtlMs: 30_000 });
const breaker = getBreaker('echo-service', { threshold: 3, timeoutMs: 10_000 });

// Configuration constants
const DEFAULT_TTL_MS = 3600000; // 1 hour
const MAX_HISTORY = 100;
const ECHO_MODES = {
  SIMPLE: 'simple',
  ENHANCED: 'enhanced',
  PREDICTIVE: 'predictive',
  AGGREGATED: 'aggregated',
};

const TRANSFORM_TYPES = {
  UPPERCASE: 'uppercase',
  LOWERCASE: 'lowercase',
  SENTIMENT: 'sentiment',
  SCORE: 'score',
  NORMALIZED: 'normalized',
};

export class EchoAgent {
  constructor(opts = {}) {
    this._mode = opts.mode ?? ECHO_MODES.ENHANCED;
    this._ttl = opts.ttl ?? DEFAULT_TTL_MS;
    this._history = [];
    this._transform = opts.transform ?? null;
    this._cacheEnabled = opts.cache !== false;
    this._maxHistory = opts.maxHistory ?? MAX_HISTORY;
    this._lastOutput = null;
    this._callCount = 0;
    this._enhancementRules = opts.enhancementRules ?? this._defaultRules();
  }

  // Default enhancement rules for different signal types
  _defaultRules() {
    return {
      bullish: { keywords: ['bull', 'moon', 'pump', 'surge', 'ath'], weight: 1.2 },
      bearish: { keywords: ['bear', 'dump', 'crash', 'rekt', 'capitulation'], weight: 0.8 },
      neutral: { keywords: ['sideways', 'consolidate', 'range', 'stability'], weight: 1.0 },
    };
  }

  /**
   * Main execution method - routes to appropriate handler based on action
   */
  async execute(input = {}, memory) {
    const t = metrics.startTimer('echo.execute');
    metrics.incMetric('echo.calls');
    this._callCount++;

    // Input validation
    if (!input && !memory) {
      throw new Error('EchoAgent requires input or memory');
    }

    // Route based on mode or input action
    const action = input.action ?? this._mode;

    try {
      let result;
      switch (action) {
        case 'reflect':
          result = await this._handleReflect(input, memory);
          break;
        case 'predictive':
          result = await this._handlePredictive(input, memory);
          break;
        case 'aggregate':
          result = await this._handleAggregate(input, memory);
          break;
        case 'transform':
          result = await this._handleTransform(input, memory);
          break;
        case 'enhance':
          result = await this._handleEnhance(input, memory);
          break;
        case 'history':
          result = await this._handleHistory(input, memory);
          break;
        case 'cache':
          result = await this._handleCache(input, memory);
          break;
        case 'pattern':
          result = await this._handlePattern(input, memory);
          break;
        case 'stream':
          result = await this._handleStream(input, memory);
          break;
        default:
          result = await this._handleDefault(input, memory);
      }

      this._lastOutput = result;

      if (memory) {
        await this._updateMemory(memory, result);
      }

      audit.echo({ input, result, callCount: this._callCount });
      log.debug('EchoAgent executed', { mode: action, timestamp: result.timestamp });
      return result;
    } catch (err) {
      metrics.incMetric('echo.errors');
      audit.error({ agent: 'echo', error: err.message, input });
      throw err;
    } finally {
      t.end({ agent: 'echo', mode: action });
    }
  }

  /**
   * Default reflection - echoes input with augmentation
   */
  async _handleDefault(input, memory) {
    const output = {
      echoed: input,
      timestamp: Date.now(),
      callId: this._callCount,
      mode: this._mode,
      source: 'echo-agent',
    };

    this._addToHistory(output);
    return output;
  }

  /**
   * Enhanced reflection with additional metadata
   */
  async _handleReflect(input, memory) {
    const sentiment = this._analyzeSentiment(input.text ?? input);
    const enhanced = {
      ...input,
      echo: {
        timestamp: Date.now(),
        callId: this._callCount,
        sentiment,
        processed: true,
      },
    };

    return enhanced;
  }

  /**
   * Predictive echo - forecasts based on historical patterns
   */
  async _handlePredictive(input, memory) {
    const pattern = this._detectPattern(input);
    const prediction = {
      input,
      pattern,
      prediction: this._forecastFromPattern(pattern),
      confidence: this._calculateConfidence(pattern),
      timestamp: Date.now(),
    };

    bus.emit('echo-predictive', prediction);
    return prediction;
  }

  /**
   * Aggregate multiple inputs
   */
  async _handleAggregate(input, memory) {
    const items = Array.isArray(input.items) ? input.items : [input];
    const aggregated = {
      count: items.length,
      items,
      summary: this._summarizeItems(items),
      timestamp: Date.now(),
    };

    return aggregated;
  }

  /**
   * Transform input according to specified type
   */
  async _handleTransform(input, memory) {
    const transformType = input.transformType ?? TRANSFORM_TYPES.NORMALIZED;
    let transformed = input;

    switch (transformType) {
      case TRANSFORM_TYPES.UPPERCASE:
        transformed = this._toUppercase(input);
        break;
      case TRANSFORM_TYPES.LOWERCASE:
        transformed = this._toLowerCase(input);
        break;
      case TRANSFORM_TYPES.SENTIMENT:
        transformed = this._applySentimentTransform(input);
        break;
      case TRANSFORM_TYPES.SCORE:
        transformed = this._scoreInput(input);
        break;
      case TRANSFORM_TYPES.NORMALIZED:
        transformed = this._normalizeInput(input);
        break;
    }

    return { original: input, transformed, transformType, timestamp: Date.now() };
  }

  /**
   * Enhance input with additional context
   */
  async _handleEnhance(input, memory) {
    const enhancement = this._applyEnhancements(input);
    return { ...input, enhancement, timestamp: Date.now() };
  }

  /**
   * Return history of echoes
   */
  async _handleHistory(input, memory) {
    const limit = input.limit ?? 10;
    return { history: this._history.slice(-limit), count: this._history.length };
  }

  /**
   * Cache management
   */
  async _handleCache(input, memory) {
    const { key, value, operation } = input;

    switch (operation) {
      case 'set':
        cache.set(key, value);
        return { cached: true, key };
      case 'get':
        const cached = cache.get(key);
        return { key, value: cached };
      case 'clear':
        const cleared = cache.clear();
        return { cleared };
      default:
        return { cacheInfo: cache.info() };
    }
  }

  /**
   * Pattern detection in input
   */
  async _handlePattern(input, memory) {
    const pattern = this._detectPattern(input);
    const matches = this._findPatternMatches(pattern);

    return {
      pattern,
      matches,
      strength: pattern.strength,
      timestamp: Date.now(),
    };
  }

  /**
   * Stream processing mode
   */
  async _handleStream(input, memory) {
    const chunks = input.chunks ?? [];
    const results = [];

    for (const chunk of chunks) {
      results.push(await this._handleDefault(chunk, null));
    }

    return { stream: true, results, count: results.length };
  }

  /**
   * Update memory with output
   */
  async _updateMemory(memory, result) {
    await memory.set('lastEcho', result);
    memory.history.push({ type: 'echo', ...result });
  }

  // Helper methods

  _addToHistory(item) {
    this._history.push(item);
    if (this._history.length > this._maxHistory) {
      this._history.shift();
    }
  }

  _analyzeSentiment(text) {
    if (!text || typeof text !== 'string') return 'neutral';

    const bullish = ['bull', 'moon', 'pump', 'surge', 'ath', 'gains'];
    const bearish = ['bear', 'dump', 'crash', 'rekt', 'capitulation', 'loss'];

    const lower = text.toLowerCase();
    let score = 0;

    bullish.forEach(w => { if (lower.includes(w)) score += 1; });
    bearish.forEach(w => { if (lower.includes(w)) score -= 1; });

    if (score > 0) return 'bullish';
    if (score < 0) return 'bearish';
    return 'neutral';
  }

  _detectPattern(input) {
    // Simple pattern detection - can be enhanced
    const text = JSON.stringify(input);
    return {
      type: text.length > 100 ? 'complex' : 'simple',
      length: text.length,
      strength: Math.min(text.length / 100, 1),
      keywords: this._extractKeywords(text),
    };
  }

  _extractKeywords(text) {
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return [...new Set(words)].slice(0, 10);
  }

  _summarizeItems(items) {
    const types = {};
    items.forEach(i => {
      const type = typeof i;
      types[type] = (types[type] || 0) + 1;
    });
    return { types, total: items.length };
  }

  _forecastFromPattern(pattern) {
    // Placeholder - real implementation would use ML
    return {
      confidence: pattern.strength * 0.7,
      timeframe: 'short',
      direction: pattern.strength > 0.5 ? 'positive' : 'neutral',
    };
  }

  _calculateConfidence(pattern) {
    return pattern.strength * 0.8 + 0.2;
  }

  _toUppercase(input) {
    if (typeof input === 'string') return input.toUpperCase();
    if (input.text) return { ...input, text: input.text.toUpperCase() };
    return input;
  }

  _toLowerCase(input) {
    if (typeof input === 'string') return input.toLowerCase();
    if (input.text) return { ...input, text: input.text.toLowerCase() };
    return input;
  }

  _applySentimentTransform(input) {
    const sentiment = this._analyzeSentiment(input.text ?? JSON.stringify(input));
    return { ...input, sentiment, timestamp: Date.now() };
  }

  _scoreInput(input) {
    const text = input.text ?? JSON.stringify(input);
    const sentiment = this._analyzeSentiment(text);
    const score = sentiment === 'bullish' ? 0.7 : sentiment === 'bearish' ? 0.3 : 0.5;
    return { ...input, score, sentiment, timestamp: Date.now() };
  }

  _normalizeInput(input) {
    // Normalize to standard format
    return {
      data: input,
      normalized: true,
      timestamp: Date.now(),
    };
  }

  _applyEnhancements(input) {
    const sentiment = this._analyzeSentiment(input.text ?? '');
    const patterns = this._detectPattern(input);
    return {
      sentiment,
      patterns,
      enhanced: true,
      timestamp: Date.now(),
    };
  }

  _findPatternMatches(pattern) {
    // Find similar patterns in history
    return this._history.filter(h =>
      h.pattern && h.pattern.type === pattern.type
    ).slice(-5);
  }

  // Public API methods
  setMode(mode) {
    this._mode = mode;
    return this;
  }

  setTransform(transform) {
    this._transform = transform;
    return this;
  }

  clearHistory() {
    this._history = [];
    return this;
  }

  getStats() {
    return {
      callCount: this._callCount,
      historySize: this._history.length,
      mode: this._mode,
      cacheEnabled: this._cacheEnabled,
    };
  }
}

export default EchoAgent;