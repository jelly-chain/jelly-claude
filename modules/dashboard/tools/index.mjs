export default async function main(opts){
  return { ok: true, module: "dashboard", tool: "index", opts: opts ?? {} };
}
