// core/workspace.mjs — Phase 2: workspace helpers
function getWorkspaceRoot(){ return process.env.BUDDY_WORKSPACE || process.cwd(); }
export { getWorkspaceRoot };
export default getWorkspaceRoot;
