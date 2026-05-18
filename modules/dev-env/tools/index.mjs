export default async function main(opts){
  return { ok: true, module: "dev-env", tool: "index", opts: opts ?? {} };
}
