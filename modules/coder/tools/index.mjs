export default async function main(opts){
  return { ok: true, module: "coder", tool: "index", opts: opts ?? {} };
}
