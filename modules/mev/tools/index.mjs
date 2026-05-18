export default async function main(opts){
  return { ok: true, module: "mev", tool: "index", opts: opts ?? {} };
}
