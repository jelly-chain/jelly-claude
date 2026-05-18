export default async function main(opts){
  return { ok: true, module: "files", tool: "index", opts: opts ?? {} };
}
