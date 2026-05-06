/** Math utilities for signal scoring and volatility calculations. */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function weightedAverage(pairs: Array<{ value: number; weight: number }>): number {
  if (pairs.length === 0) return 0;
  const totalWeight = pairs.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = pairs.reduce((sum, p) => sum + p.value * p.weight, 0);
  return weightedSum / totalWeight;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function percentChange(from: number, to: number): number {
  if (from === 0) return 0;
  return (to - from) / from;
}

export function normalizeToRange(
  value: number,
  min: number,
  max: number,
): number {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}
