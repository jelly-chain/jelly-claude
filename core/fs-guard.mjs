// core/fs-guard.mjs — Phase 2: simple path guard
export function guardPath(p){ if(!p) throw new Error('Invalid path'); return p; }
export default guardPath;
