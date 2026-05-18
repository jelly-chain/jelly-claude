export default async function main(opts){
  return { ok: true, module: "repl", tool: "index", opts: opts ?? {} };
}
