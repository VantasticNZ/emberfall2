// =============================================================================
// COLLISION AUTO-TEST (browser / dev-console) — drives the hero into EVERY solid
// object in a loaded Overworld region from all FOUR directions and asserts no
// pass-through. Paste into the dev console (or run via Playwright `evaluate`) with
// the dev server up and the game exposed as window.__EMBER.
//
// WHY a browser script (not a node test): collision is real Phaser Arcade physics,
// which only exists in the running game. The node `verify` gate asserts the COLLISION
// RULE statically (solidBox covers every prop's mass — scripts/verify.mjs gate #10);
// THIS script is the empirical "every object, every direction" proof.
//
// It uses manually-stepped physics (world.step) so it can test ~2000 objects in <1s
// instead of real-time-driving each (which would take ~30 min). Each face: place the
// player just outside the collider, push INTO it, step the world, and assert the
// player never crosses the object's centre (= never passes through).
//
// 2026-06-08 result: Greenhollow 2027 objects / 6628 face-tests / 0 fails ·
//                    Sundered Peaks 1454 objects / 5258 face-tests / 0 fails.
// =============================================================================
window.__collisionAutotest = function () {
  const s = window.__EMBER.scene.getScene('Overworld');
  const world = s.physics.world, player = s.player;
  const solids = s.solids.getChildren().filter((o) => o.body && o.body.physicsType === 1); // STATIC bodies
  const r = { region: s.region && s.region.key, objectsTested: 0, faceTests: 0, fails: [] };
  const sx0 = player.x, sy0 = player.y;
  for (const o of solids) {
    const b = o.body, cx = b.center.x, cy = b.center.y, hw = b.halfWidth, hh = b.halfHeight;
    r.objectsTested++;
    const faces = [
      { n: 'W', ax: 'x', need: hw, sx: cx - hw - 14, sy: cy, vx: 300, vy: 0 },
      { n: 'E', ax: 'x', need: hw, sx: cx + hw + 14, sy: cy, vx: -300, vy: 0 },
      { n: 'N', ax: 'y', need: hh, sx: cx, sy: cy - hh - 14, vx: 0, vy: 300 },
      { n: 'S', ax: 'y', need: hh, sx: cx, sy: cy + hh + 14, vx: 0, vy: -300 },
    ];
    for (const f of faces) {
      if (f.need < 9) continue; // object smaller than the player on this axis — can't "block outside centre"
      r.faceTests++;
      player.body.reset(f.sx, f.sy);
      for (let i = 0; i < 18; i++) { player.body.setVelocity(f.vx, f.vy); world.step(1 / 60); }
      const pos = f.ax === 'x' ? player.x : player.y;
      const crossedCentre = f.n === 'W' ? pos > cx + 1 : f.n === 'E' ? pos < cx - 1 : f.n === 'N' ? pos > cy + 1 : pos < cy - 1;
      if (crossedCentre) r.fails.push({ key: (o.texture && o.texture.key) || 'rect', face: f.n, cx: cx | 0, cy: cy | 0, endPos: pos | 0 });
    }
  }
  player.body.reset(sx0, sy0); player.body.setVelocity(0, 0);
  return r; // { region, objectsTested, faceTests, fails:[] } — fails MUST be empty
};
