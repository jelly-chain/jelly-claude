export default async function main(opts){
  return { ok: true, module: "plugins", tool: "index", opts: opts ?? {} };
}
