import { AlertDispatcherAgent } from '../../../ai-agents/alert-dispatcher.js';
import { bus }                  from '../../../core/events.mjs';
import { audit }                from '../../../core/audit.mjs';

const dispatcher = new AlertDispatcherAgent({ minSeverity: 'medium' });

export async function status(args = {}) {
  const stats = dispatcher.stats();
  const busStats = bus.stats();
  return { ok: true, dispatcher: stats, bus: busStats };
}

export async function test(args = {}) {
  const alert = {
    type:      args.type      ?? 'volume_spike',
    severity:  args.severity  ?? 'high',
    token:     args.token     ?? 'TEST',
    multiplier: args.multiplier ? Number(args.multiplier) : 5,
    message:   args.message   ?? 'Test alert from modules/alerts',
  };
  const result = await dispatcher.execute(alert);
  return { ok: true, dispatched: result?.dispatched ?? false, message: result?.message ?? '' };
}

export async function history(args = {}) {
  const n   = args.n ? Number(args.n) : 20;
  const logs = audit.query({ type: 'alert_dispatched' }).slice(-n);
  return { ok: true, count: logs.length, alerts: logs };
}

export async function config(args = {}) {
  if (args.minSeverity) dispatcher._minSeverity = args.minSeverity;
  if (args.voice !== undefined) dispatcher._voiceEnabled = args.voice === true || args.voice === 'true';
  return { ok: true, minSeverity: dispatcher._minSeverity, voice: dispatcher._voiceEnabled };
}
