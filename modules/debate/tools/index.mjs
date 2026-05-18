export default async function main(opts){
  return { ok: true, module: "debate", tool: "index", opts: opts ?? {} };
}
