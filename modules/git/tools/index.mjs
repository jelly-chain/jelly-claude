export default async function main(opts){
  return { ok: true, module: "git", tool: "index", opts: opts ?? {} };
}
