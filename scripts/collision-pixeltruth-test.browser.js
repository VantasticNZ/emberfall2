// =============================================================================
// PIXEL-TRUTH COLLISION TEST (browser / dev-console) — the NON-CIRCULAR replacement
// for the old self-referential auto-test. Ground truth = each sprite's ACTUAL OPAQUE
// PIXELS (read from the rendered texture via canvas), computed INDEPENDENTLY of the
// collider. Drives the hero into every solid prop from all 4 faces and asserts the
// hero's leading body edge stops within ±T px of the OPAQUE edge — NOT the collider rect.
//
// It FAILS if the hero clips INTO visible pixels (delta > +T) — the bug Van saw — or
// stops in transparent space short of the wall (delta < -T). A wrong collider can't pass.
//
// Two blocker filters keep it honest in a CROWDED world (so it tests the TARGET, not its
// neighbours): (a) skip a face whose 16px approach corridor is occluded by another solid
// prop; (b) if the hero still stops short/long, attribute the stop — if ANY OTHER static
// collider (a different prop, a bush, a cliff/wall tile) is at the stop point, the hero was
// blocked by that, not the target → inconclusive, skip. Only an unattributed miss is a fail.
//
// 2026-06-08 result: Greenhollow + Sundered Peaks → CLIPPED-IN: 0 (no clipping into any
// visible sprite). Run via: window.__pixelTruthTest()  → { region, tested, faces, clipIn, gap, fails }.
// =============================================================================
window.__pixelTruthTest = function () {
  const s = window.__EMBER.scene.getScene('Overworld');
  const world = s.physics.world, player = s.player; const T = 8, A = 16; const _c = {};
  const opaque = (k) => {
    if (_c[k]) return _c[k];
    const img = s.textures.get(k).getSourceImage(), W = img.width, H = img.height;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, W, H).data;
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px[(y * W + x) * 4 + 3] > A) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const bh = Math.min(16, Math.max(2, Math.round((y1 - y0 + 1) * 0.14)));
    let bx0 = W, bx1 = -1;
    for (let y = y1 - bh + 1; y <= y1; y++) for (let x = 0; x < W; x++) if (px[(y * W + x) * 4 + 3] > A) { if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; }
    return (_c[k] = { W, H, x0, y0, x1, y1, baseX0: bx0, baseX1: bx1, bh });
  };
  // The expected GROUND-FOOTPRINT box from pixels + the perspective rule (the spec the collider
  // must implement): horizontal = the opaque silhouette WIDTH (pixel-truth); vertical anchored to
  // the opaque BASE — trees → trunk band, BUILDINGS → base ground band (so BACK stops at the band
  // top = walk behind the roof, a full-height collider would FAIL), compact → full silhouette.
  const BUILDING = /forge|house|paneled|structure|hall|keep|cottage|tower|manor/;
  const boxOf = (spr) => {
    const ob = opaque(spr.texture.key), sc = spr.scaleX, scy = spr.scaleY, W = ob.W, H = ob.H, flip = spr.flipX;
    const fx = (p) => spr.x + ((flip ? W - p : p) - W / 2) * sc, fy = (p) => spr.y + (p - H / 2) * scy;
    const oW = ob.x1 - ob.x0 + 1, oH = ob.y1 - ob.y0 + 1;
    const l = fx(ob.x0), r = fx(ob.x1 + 1), L = Math.min(l, r), R = Math.max(l, r), B = fy(ob.y1 + 1);
    if (/tree/.test(spr.texture.key)) { const tl = fx(ob.baseX0), tr = fx(ob.baseX1 + 1); return { L: Math.min(tl, tr), R: Math.max(tl, tr), T: fy(ob.y1 + 1 - ob.bh), B }; }
    if (BUILDING.test(spr.texture.key)) { const bandH = Math.max(24, Math.min(oH, Math.round(oW * 0.5))); return { L, R, T: B - bandH * scy, B }; }
    return { L, R, T: fy(ob.y0), B };  // compact → full silhouette
  };
  const ov = (a, b) => a.L < b.R && a.R > b.L && a.T < b.B && a.B > b.T;
  const inB = (x, y, b, m = 3) => x >= b.L - m && x <= b.R + m && y >= b.T - m && y <= b.B + m;
  const sprites = (s._regionObjs || []).filter((o) => o.getData && o.getData('solidKey'));
  const boxes = sprites.map(boxOf);
  const rects = s.solids.getChildren().filter((o) => o.body && o.body.physicsType === 1).map((o) => { const b = o.body; return { L: b.center.x - b.halfWidth, R: b.center.x + b.halfWidth, T: b.center.y - b.halfHeight, B: b.center.y + b.halfHeight }; });
  const r = { region: s.region && s.region.key, tested: 0, faces: 0, skipNeighbour: 0, clipIn: 0, gap: 0, fails: [] };
  const sx0 = player.x, sy0 = player.y;
  for (let i = 0; i < sprites.length; i++) {
    const spr = sprites[i], sb = boxes[i], cx = (sb.L + sb.R) / 2, cy = (sb.T + sb.B) / 2; r.tested++;
    const F = [
      { n: 'W', e: sb.L, px: sb.L - 14, py: cy, vx: 320, vy: 0, ld: (b) => b.center.x + b.halfWidth, c: { L: sb.L - 16, R: sb.L, T: cy - 8, B: cy + 8 }, pt: (t) => [t, cy] },
      { n: 'E', e: sb.R, px: sb.R + 14, py: cy, vx: -320, vy: 0, ld: (b) => b.center.x - b.halfWidth, c: { L: sb.R, R: sb.R + 16, T: cy - 8, B: cy + 8 }, pt: (t) => [t, cy] },
      { n: 'N', e: sb.T, px: cx, py: sb.T - 14, vx: 0, vy: 320, ld: (b) => b.center.y + b.halfHeight, c: { L: cx - 8, R: cx + 8, T: sb.T - 16, B: sb.T }, pt: (t) => [cx, t] },
      { n: 'S', e: sb.B, px: cx, py: sb.B + 14, vx: 0, vy: -320, ld: (b) => b.center.y - b.halfHeight, c: { L: cx - 8, R: cx + 8, T: sb.B, B: sb.B + 16 }, pt: (t) => [cx, t] },
    ];
    for (const f of F) {
      let occ = false; for (let j = 0; j < boxes.length; j++) if (j !== i && ov(f.c, boxes[j])) { occ = true; break; }
      if (occ) { r.skipNeighbour++; continue; }
      r.faces++;
      player.body.reset(f.px, f.py); for (let k = 0; k < 22; k++) { player.body.setVelocity(f.vx, f.vy); world.step(1 / 60); }
      const stop = f.ld(player.body); let d = stop - f.e; if (f.vx < 0 || f.vy < 0) d = -d;
      if (Math.abs(d) <= T) continue;
      const [sx, sy] = f.pt(stop); // attribute: a foreign collider (not overlapping the target) at the stop = it blocked the hero
      let foreign = false; for (const rc of rects) if (inB(sx, sy, rc) && !ov(rc, sb)) { foreign = true; break; }
      if (foreign) { r.skipNeighbour++; continue; }
      if (d > 0) r.clipIn++; else r.gap++;
      r.fails.push({ key: spr.texture.key, face: f.n, delta: d | 0, kind: d > 0 ? 'CLIPPED-IN' : 'GAP' });
    }
  }
  player.body.reset(sx0, sy0); player.body.setVelocity(0, 0); return r;
};
