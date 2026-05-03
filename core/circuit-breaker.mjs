const STATE = { CLOSED: 'closed', OPEN: 'open', HALF_OPEN: 'half-open' };

export class CircuitBreaker {
  constructor(name, opts = {}) {
    this.name = name;
    this._threshold   = opts.threshold   ?? 5;
    this._timeoutMs   = opts.timeoutMs   ?? 30_000;
    this._halfOpenMax = opts.halfOpenMax ?? 1;
    this._state       = STATE.CLOSED;
    this._failures    = 0;
    this._lastFailure = 0;
    this._halfOpenTrials = 0;
  }

  get state() { return this._state; }
  get isOpen() { return this._state === STATE.OPEN; }

  async call(fn) {
    this._maybeReset();
    if (this._state === STATE.OPEN) {
      throw new Error(`CircuitBreaker[${this.name}] is OPEN — provider is down, skipping call`);
    }
    if (this._state === STATE.HALF_OPEN && this._halfOpenTrials >= this._halfOpenMax) {
      throw new Error(`CircuitBreaker[${this.name}] is HALF-OPEN — trial limit reached`);
    }
    try {
      if (this._state === STATE.HALF_OPEN) this._halfOpenTrials++;
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    this._failures = 0;
    this._halfOpenTrials = 0;
    this._state = STATE.CLOSED;
  }

  _onFailure() {
    this._failures++;
    this._lastFailure = Date.now();
    if (this._failures >= this._threshold) {
      this._state = STATE.OPEN;
    }
  }

  _maybeReset() {
    if (this._state === STATE.OPEN && Date.now() - this._lastFailure > this._timeoutMs) {
      this._state = STATE.HALF_OPEN;
      this._halfOpenTrials = 0;
    }
  }

  status() {
    return { name: this.name, state: this._state, failures: this._failures, lastFailure: this._lastFailure };
  }

  reset() {
    this._state = STATE.CLOSED;
    this._failures = 0;
    this._halfOpenTrials = 0;
  }
}

const _breakers = new Map();

export function getBreaker(name, opts) {
  if (!_breakers.has(name)) _breakers.set(name, new CircuitBreaker(name, opts));
  return _breakers.get(name);
}

export function allBreakers() {
  return Object.fromEntries([..._breakers.entries()].map(([k, v]) => [k, v.status()]));
}

export default { CircuitBreaker, getBreaker, allBreakers };
