import { createLogger } from './logger.mjs';
import { bus } from './events.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const THRESHOLDS = JSON.parse(readFileSync(join(__dirname, '../config/thresholds.json'), 'utf8'));

const log = createLogger('anomaly');

export class VolumeSpikeDetector {
  constructor(opts = {}) {
    this._multiplier = opts.multiplier ?? THRESHOLDS.volume.spikeMultiplier;
    this._minVolume  = opts.minVolume  ?? THRESHOLDS.volume.minVolumeUsd;
    this._window     = opts.window     ?? [];
    this._windowSize = opts.windowSize ?? 24;
  }

  addDataPoint(volumeUsd, ts = Date.now()) {
    this._window.push({ volumeUsd, ts });
    if (this._window.length > this._windowSize) this._window.shift();
  }

  detect(currentVolume) {
    if (this._window.length < 3) return null;
    const avg = this._window.reduce((s, p) => s + p.volumeUsd, 0) / this._window.length;
    if (avg < this._minVolume) return null;
    const multiplier = currentVolume / avg;
    if (multiplier < this._multiplier) return null;

    const anomaly = {
      type:        'volume_spike',
      currentVolume,
      avgVolume:   Math.round(avg),
      multiplier:  parseFloat(multiplier.toFixed(2)),
      threshold:   this._multiplier,
      severity:    multiplier >= 10 ? 'critical' : multiplier >= 5 ? 'high' : 'medium',
      ts:          Date.now(),
    };

    bus.anomaly(anomaly);
    log.warn('VolumeSpikeDetector: anomaly detected', anomaly);
    return anomaly;
  }

  detectFromPair(pair) {
    const vol24h = pair.volume?.h24 ?? 0;
    const vol6h  = (pair.volume?.h6 ?? 0) * 4;
    if (vol24h > 0) this.addDataPoint(vol24h / 24);
    return this.detect(vol6h / 6);
  }
}

export class TVLShockDetector {
  constructor(opts = {}) {
    this._shockPct  = opts.shockPct  ?? THRESHOLDS.tvl.shockPct;
    this._minTvl    = opts.minTvl    ?? THRESHOLDS.tvl.minTvlUsd;
    this._history   = [];
    this._limit     = opts.limit     ?? 48;
  }

  addSnapshot(protocol, tvlUsd, ts = Date.now()) {
    this._history.push({ protocol, tvlUsd, ts });
    if (this._history.length > this._limit) this._history.shift();
  }

  detect(protocol, currentTvl) {
    const prev = this._history.filter(h => h.protocol === protocol);
    if (prev.length < 2) return null;
    const lastTvl = prev[prev.length - 1].tvlUsd;
    if (lastTvl < this._minTvl) return null;
    const changePct = ((currentTvl - lastTvl) / lastTvl) * 100;

    if (Math.abs(changePct) < this._shockPct) return null;

    const anomaly = {
      type:       'tvl_shock',
      protocol,
      currentTvl,
      previousTvl: lastTvl,
      changePct:  parseFloat(changePct.toFixed(2)),
      direction:  changePct < 0 ? 'decline' : 'growth',
      severity:   Math.abs(changePct) >= 50 ? 'critical' : Math.abs(changePct) >= 30 ? 'high' : 'medium',
      ts:         Date.now(),
    };

    bus.anomaly(anomaly);
    log.warn('TVLShockDetector: anomaly detected', anomaly);
    return anomaly;
  }
}

export class BridgeAnomalyDetector {
  constructor(opts = {}) {
    this._multiplier = opts.multiplier ?? THRESHOLDS.bridge.anomalyMultiplier;
    this._minAmount  = opts.minAmount  ?? THRESHOLDS.bridge.minBridgeAmountUsd;
    this._history    = [];
    this._limit      = opts.limit      ?? 100;
  }

  addEvent(bridge, amountUsd, direction, ts = Date.now()) {
    this._history.push({ bridge, amountUsd, direction, ts });
    if (this._history.length > this._limit) this._history.shift();
  }

  detect(bridge, amountUsd, direction) {
    const same = this._history.filter(h => h.bridge === bridge && h.direction === direction);
    if (same.length < 5) return null;

    const avg = same.reduce((s, h) => s + h.amountUsd, 0) / same.length;
    const multiplier = amountUsd / avg;

    if (multiplier < this._multiplier || amountUsd < this._minAmount) return null;

    const anomaly = {
      type:        'bridge_anomaly',
      bridge,
      amountUsd,
      avgAmount:   Math.round(avg),
      multiplier:  parseFloat(multiplier.toFixed(2)),
      direction,
      severity:    multiplier >= 20 ? 'critical' : multiplier >= 10 ? 'high' : 'medium',
      ts:          Date.now(),
    };

    bus.anomaly(anomaly);
    log.warn('BridgeAnomalyDetector: anomaly detected', anomaly);
    return anomaly;
  }
}

export class PriceMoveDetector {
  constructor(opts = {}) {
    this._alertPct   = opts.alertPct   ?? THRESHOLDS.price.movementAlertPct;
    this._extremePct = opts.extremePct ?? THRESHOLDS.price.extremeMoveAlertPct;
    this._prices     = new Map();
  }

  update(token, price, ts = Date.now()) {
    if (!this._prices.has(token)) {
      this._prices.set(token, []);
    }
    const hist = this._prices.get(token);
    hist.push({ price, ts });
    if (hist.length > 100) hist.shift();
    return this.detect(token, price);
  }

  detect(token, currentPrice) {
    const hist = this._prices.get(token) ?? [];
    if (hist.length < 2) return null;
    const prev = hist[hist.length - 2].price;
    const changePct = ((currentPrice - prev) / prev) * 100;

    if (Math.abs(changePct) < this._alertPct) return null;

    const anomaly = {
      type:       'price_move',
      token,
      currentPrice,
      previousPrice: prev,
      changePct:  parseFloat(changePct.toFixed(2)),
      direction:  changePct < 0 ? 'decline' : 'surge',
      severity:   Math.abs(changePct) >= this._extremePct ? 'critical' : 'medium',
      ts:         Date.now(),
    };

    bus.anomaly(anomaly);
    log.warn('PriceMoveDetector: anomaly detected', anomaly);
    return anomaly;
  }
}

export default { VolumeSpikeDetector, TVLShockDetector, BridgeAnomalyDetector, PriceMoveDetector };
