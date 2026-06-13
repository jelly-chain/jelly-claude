export default async function main(opts){
  return { ok: true, module: "docs", tool: "index", opts: opts ?? {} };
}
