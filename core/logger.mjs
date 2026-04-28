// core/logger.mjs — Phase 2: enhanced structured logger with correlation IDs
let seq = 0;
function nextId(){ return ++seq; }
export function createLogger(module){
  const level = (process.env.LOG_LEVEL || 'info').toLowerCase();
  function log(levelName, ...args){
    const map = { debug:0, info:1, warn:2, error:3 };
    if ((map[levelName] ?? 1) < (map[level] ?? 1)) return;
    const entry = { ts: new Date().toISOString(), level: levelName, module, id: nextId(), payload: args };
    const out = levelName === 'error' ? console.error : console.log;
    out('[Buddy]', JSON.stringify(entry));
  }
  return {
    debug: (msg, meta) => log('debug', msg, meta),
    info:  (msg, meta) => log('info', msg, meta),
    warn:  (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
  };
}
export default createLogger;
