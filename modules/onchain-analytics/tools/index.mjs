export default async function main(opts){
  return { ok: true, module: "onchain-analytics", tool: "index", opts: opts ?? {} };
}
