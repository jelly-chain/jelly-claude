import { VolumeSpikeDetector, TVLShockDetector, BridgeAnomalyDetector } from '../../../core/anomaly.mjs';

const volDetector = new VolumeSpikeDetector();
const tvlDetector = new TVLShockDetector();
const bridgeDetector = new BridgeAnomalyDetector();

export async function anomalies(args = {}) {
  return {
    ok: true,
    volWindow:  volDetector._window.length,
    tvlHistory: tvlDetector._history.length,
    bridgeHistory: bridgeDetector._history.length,
    description: 'Use detectVolume, detectTvl for specific checks',
  };
}

export async function detectVolume(args = {}) {
  if (!args.current) return { ok: false, error: 'Missing --current (volume USD)' };
  if (args.history) {
    try {
      JSON.parse(args.history).forEach(v => volDetector.addDataPoint(Number(v)));
    } catch {}
  }
  const anomaly = volDetector.detect(Number(args.current));
  return { ok: true, anomaly, detected: anomaly !== null };
}

export async function detectTvl(args = {}) {
  if (!args.protocol || !args.current) return { ok: false, error: 'Missing --protocol or --current' };
  if (args.previous) {
    tvlDetector.addSnapshot(args.protocol, Number(args.previous));
  }
  const anomaly = tvlDetector.detect(args.protocol, Number(args.current));
  return { ok: true, anomaly, detected: anomaly !== null };
}
