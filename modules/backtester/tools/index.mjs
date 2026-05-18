export default async function main(opts){
  return { ok: true, module: "backtester", tool: "index", opts: opts ?? {} };
}
