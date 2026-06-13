export default async function main(opts){
  return { ok: true, module: "notes", tool: "index", opts: opts ?? {} };
}
