export default async function main(opts){
  return { ok: true, module: "personas", tool: "index", opts: opts ?? {} };
}
