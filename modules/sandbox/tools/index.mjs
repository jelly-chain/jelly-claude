export default async function main(opts){
  return { ok: true, module: "sandbox", tool: "index", opts: opts ?? {} };
}
