export default async function main(opts){
  return { ok: true, module: "calendar-sync", tool: "index", opts: opts ?? {} };
}
