export default async function main(opts){
  return { ok: true, module: "localLLM", tool: "index", opts: opts ?? {} };
}
