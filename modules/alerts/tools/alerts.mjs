import { AlertDispatcherAgent } from '../../../ai-agents/alert-dispatcher.js';
import { bus }                  from '../../../core/events.mjs';
import { audit }                from '../../../core/audit.mjs';
import { createMemory }         from '../../../memory/index.js';

const dispatcher = new AlertDispatcherAgent({ minSeverity: 'medium' });
const memory = createMemory();

// ... rest of the code remains the same

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

// New functions

/**
 * Add a new alert.
 * @param {Object} args - { type, condition, message, severity, token, threshold, etc. }
 */
export async function add(args = {}) {
  if (!args.type) return { ok: false, error: 'Missing --type' };
  if (!args.message) return { ok: false, error: 'Missing --message' };

  const alert = { ...args, id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
  const alerts = await getAlerts();
  alerts.push(alert);
  await saveAlerts(alerts);
  return { ok: true, message: 'Alert added', alertId: alert.id };
}

/**
 * Remove an alert by ID.
 */
export async function remove(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  const alerts = await getAlerts();
  const initialLength = alerts.length;
  const filtered = alerts.filter(a => a.id !== args.id);
  if (filtered.length === initialLength) return { ok: false, error: 'Alert not found' };
  await saveAlerts(filtered);
  return { ok: true, message: 'Alert removed' };
}

/**
 * List all alerts.
 */
export async function list(args = {}) {
  const alerts = await getAlerts();
  return { ok: true, count: alerts.length, alerts };
}

/**
 * Trigger an alert manually (e.g., for testing).
 */
export async function trigger(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  const alerts = await getAlerts();
  const alert = alerts.find(a => a.id === args.id);
  if (!alert) return { ok: false, error: 'Alert not found' };
  // Dispatch the alert
  const result = await dispatcher.execute(alert);
  return { ok: true, dispatched: result?.dispatched ?? false, message: result?.message ?? '' };
}

async function getAlerts() {
  // Try to load from memory or file
  const alerts = await memory.get('alerts');
  return alerts || [];
}

async function saveAlerts(alerts) {
  await memory.set('alerts', alerts);
}
