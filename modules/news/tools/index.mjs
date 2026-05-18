export default async function main(opts){
  return { ok: true, module: "news", tool: "index", opts: opts ?? {} };
}
