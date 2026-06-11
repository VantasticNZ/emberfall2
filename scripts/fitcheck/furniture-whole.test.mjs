// FURNITURE-WHOLE gate — a furniture sprite must be a SINGLE opaque piece, not a multi-part SHEET with a
// transparent band in the middle (which renders SLICED, the floor showing through — Van's "split bed").
// Gate #22 (footprint) passed on canvas DATA and missed this — the wrong layer again (PROCESS-RETRO).
// This decodes the real PNG alpha and asserts no all-transparent ROW sits between two opaque rows.
import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// minimal 8-bit RGBA PNG decoder (colorType 6, non-interlaced) — same approach as build_opaque_bounds.mjs
function rowOpacity(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG: ' + file);
  let off = 8, w = 0, h = 0, bd = 0, ct = 0, il = 0; const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off); const type = buf.toString('ascii', off + 4, off + 8); const data = buf.slice(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; il = data[12]; }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bd !== 8 || ct !== 6 || il !== 0) return null;   // unsupported encoding → skip (don't false-fail)
  const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = w * 4; const out = [];
  const cur = Buffer.alloc(stride), prev = Buffer.alloc(stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++]; cur.fill(0);
    for (let x = 0; x < stride; x++) {
      const rb = raw[p++], a = x >= 4 ? cur[x - 4] : 0, b = prev[x], c = x >= 4 ? prev[x - 4] : 0;
      let v = rb;
      if (f === 1) v = rb + a; else if (f === 2) v = rb + b; else if (f === 3) v = rb + ((a + b) >> 1);
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); v = rb + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      cur[x] = v & 0xff;
    }
    let opaque = 0; for (let x = 3; x < stride; x += 4) if (cur[x] > 20) opaque++;
    out.push(opaque); cur.copy(prev);
  }
  return out;
}

const FURN_DIR = path.join(ROOT, 'public/art/furniture');
// only the props actually placed as solid interior furniture (graves/door render fine; skip non-furniture)
const SKIP = new Set(['door.png', 'grave_headstone.png', 'grave_cross.png', 'grave_woodcross.png', 'grave_open.png', 'grave_large.png', 'altar.png']);
let checked = 0;
for (const f of fs.readdirSync(FURN_DIR)) {
  if (!f.endsWith('.png') || SKIP.has(f)) continue;
  const rows = rowOpacity(path.join(FURN_DIR, f)); if (!rows) continue;
  const opq = rows.map((c, i) => (c > 0 ? i : -1)).filter((i) => i >= 0);
  if (!opq.length) continue;
  const gaps = []; for (let y = opq[0]; y <= opq[opq.length - 1]; y++) if (rows[y] === 0) gaps.push(y);
  assert.equal(gaps.length, 0, `${f}: MULTI-PIECE sprite — ${gaps.length} all-transparent row(s) (${gaps[0]}..${gaps[gaps.length - 1]}) between opaque regions → renders SLICED. Crop to a single object.`);
  checked++;
}
console.log(`\n✓ furniture-whole: all ${checked} interior-furniture sprites are SINGLE opaque pieces (no mid-gap → no split render)`);
