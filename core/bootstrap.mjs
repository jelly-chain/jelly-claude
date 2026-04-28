// Phase 2 bootstrap file (in-folder) - wires memory/env load
import initCore from './init-core.mjs' ;
export async function bootstrap(){
  const core = await initCore();
  return { ok: true, core };
}
export default bootstrap;
