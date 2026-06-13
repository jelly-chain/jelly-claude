export default async function main(opts){
  return { ok: true, module: "monitor", tool: "index", opts: opts ?? {} };
}
