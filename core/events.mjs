import { EventEmitter } from 'node:events';

class JellyEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this._history = [];
    this._historyLimit = 500;
  }

  emit(event, ...args) {
    this._history.push({ event, args, ts: Date.now() });
    if (this._history.length > this._historyLimit) this._history.shift();
    return super.emit(event, ...args);
  }

  onSignal(handler)    { this.on('signal', handler);    return () => this.off('signal', handler); }
  onAnomaly(handler)   { this.on('anomaly', handler);   return () => this.off('anomaly', handler); }
  onAlert(handler)     { this.on('alert', handler);     return () => this.off('alert', handler); }
  onTrade(handler)     { this.on('trade', handler);     return () => this.off('trade', handler); }
  onPrediction(handler){ this.on('prediction', handler);return () => this.off('prediction', handler); }
  onRisk(handler)      { this.on('risk', handler);      return () => this.off('risk', handler); }
  onError(handler)     { this.on('error', handler);     return () => this.off('error', handler); }

  signal(data)    { this.emit('signal',     { ...data, ts: Date.now() }); }
  anomaly(data)   { this.emit('anomaly',    { ...data, ts: Date.now() }); }
  alert(data)     { this.emit('alert',      { ...data, ts: Date.now() }); }
  trade(data)     { this.emit('trade',      { ...data, ts: Date.now() }); }
  prediction(data){ this.emit('prediction', { ...data, ts: Date.now() }); }
  risk(data)      { this.emit('risk',       { ...data, ts: Date.now() }); }

  history(event, n = 20) {
    const events = event
      ? this._history.filter(e => e.event === event)
      : this._history;
    return events.slice(-n);
  }

  stats() {
    const counts = {};
    for (const e of this._history) {
      counts[e.event] = (counts[e.event] ?? 0) + 1;
    }
    return { total: this._history.length, counts };
  }

  clearHistory() { this._history = []; }
}

export const bus = new JellyEventBus();
export default bus;
