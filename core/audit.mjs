import { createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger } from './logger.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR  = join(__dirname, '../logs');

const log = createLogger('audit');

class AuditLog {
  constructor(opts = {}) {
    this._file    = opts.file ?? join(LOGS_DIR, 'audit.jsonl');
    this._stream  = null;
    this._buf     = [];
    this._bufSize = opts.bufSize ?? 50;
    this._seq     = 0;
    this._enabled = opts.enabled !== false;
    this._init();
  }

  _init() {
    try {
      if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true });
      this._stream = createWriteStream(this._file, { flags: 'a', encoding: 'utf8' });
    } catch (e) {
      log.warn('AuditLog: could not open file, using in-memory only', { error: e.message });
    }
  }

  write(entry) {
    if (!this._enabled) return;
    const record = {
      seq:   ++this._seq,
      ts:    new Date().toISOString(),
      ...entry,
    };
    this._buf.push(record);
    if (this._buf.length > 2000) this._buf.shift();

    const line = JSON.stringify(record) + '\n';
    if (this._stream) {
      try { this._stream.write(line); } catch { /* non-fatal */ }
    }
    return record;
  }

  prediction(data)  { return this.write({ type: 'prediction',  ...data }); }
  trade(data)       { return this.write({ type: 'trade',       ...data }); }
  riskBlock(data)   { return this.write({ type: 'risk_block',  ...data }); }
  anomaly(data)     { return this.write({ type: 'anomaly',     ...data }); }
  signal(data)      { return this.write({ type: 'signal',      ...data }); }
  agentCall(data)   { return this.write({ type: 'agent_call',  ...data }); }
  toolCall(data)    { return this.write({ type: 'tool_call',   ...data }); }
  error(data)       { return this.write({ type: 'error',       ...data }); }

  query(filter = {}) {
    return this._buf.filter(r => {
      if (filter.type  && r.type  !== filter.type)  return false;
      if (filter.chain && r.chain !== filter.chain) return false;
      if (filter.after && r.seq   <  filter.after)  return false;
      return true;
    });
  }

  tail(n = 20) { return this._buf.slice(-n); }
  all()        { return [...this._buf]; }
  count()      { return this._buf.length; }

  stats() {
    const byType = {};
    for (const r of this._buf) byType[r.type] = (byType[r.type] ?? 0) + 1;
    return { total: this._buf.length, byType, seq: this._seq };
  }

  close() {
    this._stream?.end();
  }
}

export const audit = new AuditLog();
export default audit;
