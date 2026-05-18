export default async function main(opts){
  return { ok: true, module: "rollback", tool: "index", opts: opts ?? {} };
}
