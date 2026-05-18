export default async function main(opts){
  return { ok: true, module: "macos", tool: "index", opts: opts ?? {} };
}
