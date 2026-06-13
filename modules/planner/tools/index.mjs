export default async function main(opts){
  return { ok: true, module: "planner", tool: "index", opts: opts ?? {} };
}
