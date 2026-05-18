export default async function main(opts){
  return { ok: true, module: "blockchain", tool: "index", opts: opts ?? {} };
}
