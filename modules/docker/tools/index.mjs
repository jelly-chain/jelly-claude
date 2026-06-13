export default async function main(opts){
  return { ok: true, module: "docker", tool: "index", opts: opts ?? {} };
}
