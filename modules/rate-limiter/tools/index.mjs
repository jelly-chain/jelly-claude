export default async function main(opts){
  return { ok: true, module: "rate-limiter", tool: "index", opts: opts ?? {} };
}
