import { createLogger }  from './logger.mjs';
import { createMemory }  from '../memory/index.js';
import { createPlanner } from '../planner/index.js';
import { metrics }       from './metrics.mjs';
import { bus }           from './events.mjs';
import { audit }         from './audit.mjs';
import { platformInfo }  from './platform.mjs';

const log = createLogger('init-core');
let _core = null;

export async function initCore(opts = {}) {
  if (_core) return _core;
  const pinfo = platformInfo();
  log.info('Initialising Jelly-Claude core', { platform: pinfo.os, home: pinfo.home });

  const memory  = createMemory(opts.memory ?? {});
  const planner = createPlanner(memory);

  metrics.incMetric('core.init');
  audit.write({ type: 'core_init', platform: pinfo.os, arch: pinfo.arch });
  bus.on('error', err => log.error('Bus error', { err: String(err) }));

  _core = { memory, planner, metrics, bus, audit, log, platform: pinfo };
  return _core;
}

export function getCore() { return _core; }
export default initCore;
