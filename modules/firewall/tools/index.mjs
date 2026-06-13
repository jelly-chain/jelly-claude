export default async function main(opts){
  return { ok: true, module: "firewall", tool: "index", opts: opts ?? {} };
}
