export default async function main(opts){
  return { ok: true, module: "email", tool: "index", opts: opts ?? {} };
}
