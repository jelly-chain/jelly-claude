export default async function main(opts){
  return { ok: true, module: "browser", tool: "index", opts: opts ?? {} };
}
