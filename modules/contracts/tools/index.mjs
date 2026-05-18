export default async function main(opts){
  return { ok: true, module: "contracts", tool: "index", opts: opts ?? {} };
}
