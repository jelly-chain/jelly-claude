export default async function main(opts){
  return { ok: true, module: "evm", tool: "index", opts: opts ?? {} };
}
