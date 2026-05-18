export default async function main(opts){
  return { ok: true, module: "rust", tool: "index", opts: opts ?? {} };
}
