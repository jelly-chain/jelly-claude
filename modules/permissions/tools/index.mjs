export default async function main(opts){
  return { ok: true, module: "permissions", tool: "index", opts: opts ?? {} };
}
