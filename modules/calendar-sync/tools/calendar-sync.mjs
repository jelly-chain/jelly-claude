import { getCache } from '../../../core/cache.mjs';

const cache = getCache('calendar-sync', { defaultTtlMs: 60_000 });

export async function listEvents(args = {}) {
  // Mock Google Calendar events
  const events = [
    { id: '1', summary: 'Team Meeting', start: '2024-01-01T10:00:00Z', end: '2024-01-01T11:00:00Z' },
    { id: '2', summary: 'Code Review', start: '2024-01-02T14:00:00Z', end: '2024-01-02T15:00:00Z' },
  ];
  return { ok: true, events };
}

export async function createEvent(args = {}) {
  if (!args.summary) return { ok: false, error: 'Missing --summary' };
  // Simulate creating an event
  return {
    ok: true,
    message: 'Event created',
    event: { id: '3', summary: args.summary, start: args.start, end: args.end },
  };
}

export async function updateEvent(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  // Simulate updating an event
  return {
    ok: true,
    eventId: args.id,
    message: 'Event updated',
  };
}

export async function deleteEvent(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  // Simulate deleting an event
  return {
    ok: true,
    eventId: args.id,
    message: 'Event deleted',
  };
}