/**
 * core/prediction-journal.mjs
 *
 * Records every prediction with its inputs and resolves outcomes after market close.
 * Enables accuracy tracking, threshold calibration, and predictor feedback loops.
 *
 * Storage: ~/.jelly-claude/journal/YYYY-MM.ndjson (monthly files)
 * Resolution: manual via resolveOutcome() or auto via pollMarketOutcomes()
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, openSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createLogger } from './logger.mjs';
import { bus } from './events.mjs';
import { metrics } from './metrics.mjs';

const log = createLogger('prediction-journal');
const JOURNAL_DIR = join(homedir(), '.jelly-claude', 'journal');

function ensureDir() {
  if (!existsSync(JOURNAL_DIR)) mkdirSync(JOURNAL_DIR, { recursive: true });
}

function getJournalPath(ts = Date.now()) {
  ensureDir();
  const d = new Date(ts);
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  return join(JOURNAL_DIR, `${ym}.ndjson`);
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Record a prediction to the journal.
 * @param {Object} entry
 * @param {string}  entry.market      - market identifier (e.g. "polymarket:0xabc", "kalshi:fed-rate-june")
 * @param {string}  entry.question    - human-readable market question
 * @param {string}  entry.signal      - 'bullish' | 'bearish' | 'neutral'
 * @param {number}  entry.jellyScore  - 0-100
 * @param {number}  entry.confidence  - 0-1
 * @param {number}  entry.riskScore   - 0-1
 * @param {number}  entry.edgeScore   - 0-100
 * @param {number}  entry.marketPrice - YES price at time of prediction (0-1)
 * @param {string}  [entry.platform]  - 'polymarket' | 'kalshi' | 'predict.fun'
 * @param {string}  [entry.agent]     - agent that made the prediction
 * @param {Object}  [entry.factors]   - raw prediction factors
 */
export function recordPrediction(entry) {
  const ts = Date.now();
  const row = {
    id: `pred_${ts}_${Math.random().toString(36).slice(2, 8)}`,
    ts,
    datetime: new Date(ts).toISOString(),
    market: entry.market ?? 'unknown',
    question: entry.question ?? '',
    platform: entry.platform ?? null,
    signal: entry.signal ?? 'neutral',
    jellyScore: entry.jellyScore ?? 0,
    confidence: entry.confidence ?? 0,
    riskScore: entry.riskScore ?? 0,
    edgeScore: entry.edgeScore ?? 0,
    marketPrice: entry.marketPrice ?? null,
    agent: entry.agent ?? null,
    factors: entry.factors ?? null,
    outcome: null,
    resolvedTs: null,
    correct: null,
    profitLoss: null,
  };

  try {
    const path = getJournalPath(ts);
    const fd = openSync(path, 'a');
    writeFileSync(fd, JSON.stringify(row) + '\n');
    closeSync(fd);
    metrics.incMetric('journal.predictions_recorded');
    log.debug('Prediction recorded', { id: row.id, market: row.market });
  } catch (err) {
    log.error('Failed to record prediction', { error: err.message });
  }

  return row;
}

// ── Resolve ───────────────────────────────────────────────────────────────────

/**
 * Resolve a prediction outcome.
 * @param {string} predictionId
 * @param {'win'|'loss'|'push'} outcome
 * @param {number} [profitLoss]  - USD P&L
 */
export function resolveOutcome(predictionId, outcome, profitLoss = null) {
  const files = _getAllFiles();
  for (const file of files) {
    try {
      const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
      for (let i = 0; i < lines.length; i++) {
        const entry = JSON.parse(lines[i]);
        if (entry.id === predictionId) {
          entry.outcome = outcome;
          entry.resolvedTs = Date.now();
          entry.correct = outcome === 'win';
          entry.profitLoss = profitLoss;
          lines[i] = JSON.stringify(entry);

          // Rewrite the file
          writeFileSync(file, lines.join('\n') + '\n');

          metrics.incMetric(`journal.outcomes.${outcome}`);
          bus.emit('prediction:resolved', entry);
          log.info('Prediction resolved', { id: predictionId, outcome, profitLoss });
          return entry;
        }
      }
    } catch { /* skip unreadable files */ }
  }

  log.warn('Prediction not found for resolution', { predictionId });
  return null;
}

// ── Read / Analyse ────────────────────────────────────────────────────────────

/**
 * Read all predictions for a given month.
 * @param {number} year
 * @param {number} month  (1-12)
 */
export function readPredictions(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
  const path = getJournalPath(new Date(year, month - 1).getTime());
  if (!existsSync(path)) return [];
  try {
    return readFileSync(path, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  } catch {
    return [];
  }
}

/**
 * Compute accuracy statistics.
 * @param {Object} opts
 * @param {number} [opts.year]
 * @param {number} [opts.month]
 * @param {string} [opts.platform]
 * @param {number} [opts.minJellyScore]
 */
export function computeAccuracy(opts = {}) {
  let preds = [];

  if (opts.year && opts.month) {
    preds = readPredictions(opts.year, opts.month);
  } else {
    // Read all
    const files = _getAllFiles();
    for (const file of files) {
      try {
        const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
        preds.push(...lines.map(l => JSON.parse(l)));
      } catch { /* skip */ }
    }
  }

  if (opts.platform) preds = preds.filter(p => p.platform === opts.platform);
  if (opts.minJellyScore) preds = preds.filter(p => (p.jellyScore ?? 0) >= opts.minJellyScore);

  const resolved = preds.filter(p => p.outcome != null);
  const wins = resolved.filter(p => p.outcome === 'win');
  const losses = resolved.filter(p => p.outcome === 'loss');
  const totalPnl = resolved.reduce((s, p) => s + (p.profitLoss ?? 0), 0);

  // Score calibration: average win/loss jellyScore
  const avgWinScore = wins.length > 0 ? wins.reduce((s, p) => s + (p.jellyScore ?? 0), 0) / wins.length : 0;
  const avgLossScore = losses.length > 0 ? losses.reduce((s, p) => s + (p.jellyScore ?? 0), 0) / losses.length : 0;

  // Threshold recommendation: the min jellyScore where win rate > 60%
  const scoreBuckets = {};
  for (const p of resolved) {
    const bucket = Math.floor((p.jellyScore ?? 0) / 10) * 10;
    if (!scoreBuckets[bucket]) scoreBuckets[bucket] = { wins: 0, total: 0 };
    scoreBuckets[bucket].total++;
    if (p.outcome === 'win') scoreBuckets[bucket].wins++;
  }

  const calibratedThreshold = Object.entries(scoreBuckets)
    .filter(([, b]) => b.wins / b.total > 0.6 && b.total >= 5)
    .map(([bucket]) => parseInt(bucket, 10))
    .sort((a, b) => a - b)[0] ?? 60;

  return {
    total: preds.length,
    resolved: resolved.length,
    unresolved: preds.length - resolved.length,
    wins: wins.length,
    losses: losses.length,
    pushes: resolved.filter(p => p.outcome === 'push').length,
    winRate: resolved.length > 0 ? parseFloat((wins.length / resolved.length).toFixed(4)) : 0,
    totalPnl: parseFloat(totalPnl.toFixed(4)),
    avgWinScore: parseFloat(avgWinScore.toFixed(1)),
    avgLossScore: parseFloat(avgLossScore.toFixed(1)),
    scoreCalibration: scoreBuckets,
    recommendedMinJellyScore: calibratedThreshold,
    ts: Date.now(),
  };
}

/**
 * Get all unresolved predictions (for polling).
 */
export function getUnresolved() {
  const files = _getAllFiles();
  const unresolved = [];
  for (const file of files) {
    try {
      const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
      for (const line of lines) {
        const entry = JSON.parse(line);
        if (!entry.outcome) unresolved.push(entry);
      }
    } catch { /* skip */ }
  }
  return unresolved;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _getAllFiles() {
  ensureDir();
  return readdirSync(JOURNAL_DIR)
    .filter(f => f.endsWith('.ndjson'))
    .map(f => join(JOURNAL_DIR, f))
    .sort();
}

export default { recordPrediction, resolveOutcome, readPredictions, computeAccuracy, getUnresolved };
