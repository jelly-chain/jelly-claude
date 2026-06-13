export default async function main(opts){
  return { ok: true, module: "memory", tool: "index", opts: opts ?? {} };
}
