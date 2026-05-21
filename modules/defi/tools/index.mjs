export default async function main(opts){
  return { ok: true, module: "defi", tool: "index", opts: opts ?? {} };
}