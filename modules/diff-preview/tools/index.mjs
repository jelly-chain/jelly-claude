export default async function main(opts){
  return { ok: true, module: "diff-preview", tool: "index", opts: opts ?? {} };
}
