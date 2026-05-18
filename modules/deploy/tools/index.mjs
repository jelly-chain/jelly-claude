export default async function main(opts){
  return { ok: true, module: "deploy", tool: "index", opts: opts ?? {} };
}
