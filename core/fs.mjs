import { readFile, writeFile, mkdir, access, constants } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUDDY_ROOT = process.env.BUDDY_ROOT || dirname(__dirname);
const FORBIDDEN_PATHS = JSON.parse(readFileSync(join(BUDDY_ROOT, 'config/forbidden-paths.json'), 'utf8'));

export async function safeRead(path, { maxSize = 10_000_000 } = {}) {
  const abs = join(BUDDY_ROOT, path);
  if (isForbidden(abs)) return { ok: false, error: 'forbidden path' };
  
  try {
    await access(abs, constants.R_OK);
    const data = await readFile(abs, 'utf8');
    if (data.length > maxSize) return { ok: false, error: 'file too large' };
    return { ok: true, path: abs, content: data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function safeWrite(path, content, { mkdirp = true } = {}) {
  const abs = join(BUDDY_ROOT, path);
  if (isForbidden(abs)) return { ok: false, error: 'forbidden path' };
  
  try {
    if (mkdirp) {
      const dir = dirname(abs);
      if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    }
    await writeFile(abs, content, 'utf8');
    return { ok: true, path: abs };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function isForbidden(path) {
  return FORBIDDEN_PATHS.some(glob => path.includes(glob.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

export { BUDDY_ROOT };
export default { safeRead, safeWrite };
