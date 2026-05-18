export default async function main(opts){
  return { ok: true, module: "context", tool: "index", opts: opts ?? {} };
}
