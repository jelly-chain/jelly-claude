export default async function main(opts){
  return { ok: true, module: "alerts", tool: "index", opts: opts ?? {} };
}
