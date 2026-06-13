// Jelly-Claude Persistent Memory Module
// Provides a JSON-file-backed memory store for agent state that survives
// process restarts. Falls back to pure in-memory if disk is unavailable.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const PERSIST_DIR  = join(homedir(), '.jelly-claude', 'memory');
const PERSIST_FILE = join(PERSIST_DIR, 'state.json');

function loadFromDisk() {
  try {
    if (existsSync(PERSIST_FILE)) {
      const raw = readFileSync(PERSIST_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return parsed instanceof Object ? parsed : {};
    }
  } catch {
    // Disk read failed — start fresh
  }
  return {};
}

function saveToDisk(data) {
  try {
    if (!existsSync(PERSIST_DIR)) {
      mkdirSync(PERSIST_DIR, { recursive: true });
    }
    // Only persist serializable, non-function values
    const safe = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && typeof v !== 'function') {
        try {
          // Verify it's JSON-serializable
          JSON.stringify(v);
          safe[k] = v;
        } catch {
          // Skip non-serializable values
        }
      }
    }
    writeFileSync(PERSIST_FILE, JSON.stringify(safe, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export function createMemory(initialData = {}) {
  // Load existing persisted state, then overlay any explicit initialData
  const persisted = loadFromDisk();
  const merged = { ...persisted, ...initialData };

  const store  = new Map(Object.entries(merged));
  const history = [];

  // Pre-load history from persisted state if available
  if (Array.isArray(persisted.__history)) {
    history.push(...persisted.__history);
  }

  function persist() {
    const data = Object.fromEntries(store);
    data.__history = history.slice(-100); // Keep last 100 history entries
    data.__lastPersisted = Date.now();
    saveToDisk(data);
  }

  return {
    set(key, value) {
      store.set(key, value);
      persist();
      return value;
    },

    get(key) {
      return Promise.resolve(store.get(key));
    },

    has(key) {
      return store.has(key);
    },

    delete(key) {
      store.delete(key);
      persist();
    },

    clear() {
      store.clear();
      history.length = 0;
      persist();
    },

    keys() {
      return Array.from(store.keys());
    },

    list() {
      return Promise.resolve(
        Array.from(store.entries())
          .filter(([k]) => !k.startsWith('__')) // Hide internal keys
          .map(([key, value]) => ({ key, value }))
      );
    },

    get history() {
      return history.slice(0, 100);
    },

    push(entry) {
      history.push({ ...entry, ts: Date.now() });
      if (history.length > 200) history.shift();
      persist();
    },

    // TTL support
    ttl: new Map(),

    setTTL(key, ms) {
      if (ms > 0) this.ttl.set(key, Date.now() + ms);
    },

    cleanup() {
      const now = Date.now();
      for (const [key, expiry] of this.ttl) {
        if (now > expiry) {
          store.delete(key);
          this.ttl.delete(key);
        }
      }
    },

    // Explicitly flush to disk (useful before shutdown)
    flush() {
      persist();
    },

    // Compact: remove old history and persist
    compact(maxAgeMs = 86400000) {
      const cutoff = Date.now() - maxAgeMs;
      const idx = history.findIndex(h => (h.ts ?? 0) >= cutoff);
      if (idx > 0) history.splice(0, idx);
      persist();
    },

    // Replace entire memory with new data (used by checkpoint restore)
    replaceWith(data) {
      store.clear();
      history.length = 0;
      if (data) {
        for (const [k, v] of Object.entries(data)) {
          if (!k.startsWith('__')) store.set(k, v);
        }
        if (Array.isArray(data.history)) {
          history.push(...data.history);
        }
      }
      persist();
    },

    // Export full state (for checkpoints)
    export() {
      return {
        data: Object.fromEntries(
          Array.from(store.entries()).filter(([k]) => !k.startsWith('__'))
        ),
        history: history.slice(-100),
        exportedAt: Date.now(),
      };
    },
  };
}
