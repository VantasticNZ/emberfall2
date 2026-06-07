// =============================================================================
// ⚠ THROWAWAY / EXPERIMENTAL — WORLD-MIGRATION PHASE 0 PROTOTYPE (NOT SHIPPED).
// Per docs/WORLD-STRUCTURE-DESIGN.md §1.5 Phase 0. Sacrificial test world to PROVE,
// before touching Greenhollow/Marsh/Peaks:
//   1. ONE world-coordinate space spanning many areas (no per-scene tile origin)
//   2. AREA/CHUNK STREAMING — load/unload around the player (the whole world is
//      never resident); hysteresis + object POOLING (no create/destroy churn)
//   3. SEAMLESS HANDOFF — walk across chunk borders with NO hard cut / NO pop/seam
//   4. CAMERA — continuous follow across borders, no jump/reset at a seam
//   5. PERFORMANCE — FPS + frame-time + the load HITCH (the key Phase-0 finding)
//
// Placeholder art ONLY (runtime-generated textures) — quality is NOT the point.
// Isolated: imports NO real region/world data; touches no real scene. Reached via
// `window.__EMBER.scene.start('Prototype')` (dev). Delete after the go/no-go.
// =============================================================================

import Phaser from 'phaser';

const TILE = 32;
const CHUNK = 32;                       // tiles per chunk side
const CHUNK_PX = CHUNK * TILE;          // 1024 px
const WORLD_CHUNKS = 16;                // 16×16 chunk world…
const WORLD_PX = WORLD_CHUNKS * CHUNK_PX; // …= 16384 px (256×256 tiles) — far bigger than any real scene
const LOAD_RING = 2;                    // load chunks within this Chebyshev dist of the player chunk -> 5×5 = 25
const UNLOAD_RING = 3;                  // keep until beyond this -> 7×7 (HYSTERESIS: no thrash at a border)
let LOAD_BUDGET = 1;                    // max chunks instantiated per frame (spreads load to kill the hitch)
const PROPS_PER_CHUNK = 26;             // placeholder scenery -> a realistic active-object/draw load

// a tiny seeded PRNG so each chunk's content is deterministic (stable on reload)
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const key = (cx, cy) => `${cx},${cy}`;

export class PrototypeScene extends Phaser.Scene {
  constructor() { super('Prototype'); }

  create() {
    this.cameras.main.setBackgroundColor('#10141a');
    this._genTextures();

    // world-coord camera + physics bounds = the WHOLE world (not a per-scene small box)
    this.physics.world.setBounds(0, 0, WORLD_PX, WORLD_PX);
    this.cameras.main.setBounds(0, 0, WORLD_PX, WORLD_PX);

    // streaming state
    this.chunks = new Map();            // key -> { container, ground, props[], cx, cy }
    this.pool = [];                     // recycled chunk objects (POOLING — no churn)
    this.loadQueue = [];                // chunks waiting to instantiate (budgeted per frame)
    this._lastChunk = null;
    this.showGrid = false;

    // player — a generated sprite, starts at world centre; manual world-coord movement
    this.player = this.physics.add.sprite(WORLD_PX / 2, WORLD_PX / 2, 'proto_player').setDepth(1e6);
    this.player.body.setSize(20, 20);
    this.cameras.main.startFollow(this.player, true, 0.16, 0.16);   // CONTINUOUS follow (the deadzone-style lerp)
    this.cameras.main.setZoom(1);

    // input
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,G,R,B,O');
    this.input.keyboard.on('keydown-G', () => { this.showGrid = !this.showGrid; this._redrawAllGrids(); });
    this.input.keyboard.on('keydown-R', () => this._resetPerf());          // reset perf counters
    this.input.keyboard.on('keydown-B', () => { LOAD_BUDGET = LOAD_BUDGET >= 99 ? 1 : 99; this._resetPerf(); }); // toggle budgeted vs all-at-once (to MEASURE the hitch)
    this.input.keyboard.on('keydown-O', () => { this.auto = !this.auto; this._autoT = 0; });   // auto-stress run

    // perf instrumentation
    this._resetPerf();
    this.auto = false; this._autoT = 0;

    // HUD (fixed to camera)
    this.hud = this.add.text(8, 8, '', { fontFamily: 'monospace', fontSize: '13px', color: '#bfe8ff', backgroundColor: '#000a', padding: { x: 6, y: 4 } }).setScrollFactor(0).setDepth(2e6);
    this.add.text(8, 410, 'PHASE-0 PROTO (throwaway). WASD/arrows move · SHIFT sprint · O auto-run · B budget on/off · G grid · R reset perf', { fontFamily: 'monospace', fontSize: '11px', color: '#88aa99', backgroundColor: '#000a', padding: { x: 4, y: 2 } }).setScrollFactor(0).setDepth(2e6);

    this._restream(true);
    // expose perf for headless capture
    this.perf = () => ({ fps: Math.round(this.game.loop.actualFps), avgMs: +this._avg().toFixed(2), maxMs: +this._maxMs.toFixed(2), loaded: this.chunks.size, pooled: this.pool.length, created: this._everCreated, drops: this._drops, loadSpikes: this._loadSpikes });
  }

  // ---- placeholder textures (runtime-generated; no art assets) ----------------
  _genTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // a 32×32 white tile (tinted per-chunk for the ground tileSprite)
    g.fillStyle(0xffffff, 1).fillRect(0, 0, TILE, TILE); g.generateTexture('proto_tile', TILE, TILE); g.clear();
    // a "tree" blob + a "rock" — cheap placeholder props
    g.fillStyle(0xffffff, 1).fillCircle(10, 10, 9); g.generateTexture('proto_tree', 20, 20); g.clear();
    g.fillStyle(0xffffff, 1).fillRect(0, 0, 14, 10); g.generateTexture('proto_rock', 14, 10); g.clear();
    // player dot
    g.fillStyle(0xffe66d, 1).fillCircle(11, 11, 10); g.lineStyle(2, 0x000000, 1).strokeCircle(11, 11, 10); g.generateTexture('proto_player', 22, 22); g.destroy();
  }

  // a continuous biome colour as a function of WORLD position (so adjacent chunks
  // blend into one varied landmass; the eye reads no hard chunk boundary)
  _biome(cx, cy) {
    const u = cx / WORLD_CHUNKS, v = cy / WORLD_CHUNKS;
    const r = 60 + 120 * u, gg = 90 + 110 * v, b = 70 + 80 * (1 - u) * (1 - v);
    return (Math.min(255, r) << 16) | (Math.min(255, gg) << 8) | Math.min(255, b);
  }

  // ---- streaming ------------------------------------------------------------
  _restream(immediate = false) {
    const pcx = Math.floor(this.player.x / CHUNK_PX), pcy = Math.floor(this.player.y / CHUNK_PX);
    // UNLOAD anything beyond the unload ring (hysteresis)
    for (const [k, c] of this.chunks) {
      if (Math.max(Math.abs(c.cx - pcx), Math.abs(c.cy - pcy)) > UNLOAD_RING) { this._release(k, c); }
    }
    // QUEUE loads within the load ring (skip already-loaded / out-of-world)
    for (let dy = -LOAD_RING; dy <= LOAD_RING; dy++) {
      for (let dx = -LOAD_RING; dx <= LOAD_RING; dx++) {
        const cx = pcx + dx, cy = pcy + dy;
        if (cx < 0 || cy < 0 || cx >= WORLD_CHUNKS || cy >= WORLD_CHUNKS) continue;
        const k = key(cx, cy);
        if (this.chunks.has(k) || this.loadQueue.some((q) => q.k === k)) continue;
        this.loadQueue.push({ k, cx, cy, d: Math.max(Math.abs(dx), Math.abs(dy)) });
      }
    }
    this.loadQueue.sort((a, b) => a.d - b.d);   // nearest-first
    if (immediate) while (this.loadQueue.length) this._instantiate(this.loadQueue.shift());
  }

  _drainQueue() {
    let n = 0; this._loadedThisFrame = 0;
    while (this.loadQueue.length && n < LOAD_BUDGET) { this._instantiate(this.loadQueue.shift()); n++; this._loadedThisFrame++; }
  }

  _instantiate({ k, cx, cy }) {
    const ox = cx * CHUNK_PX, oy = cy * CHUNK_PX, tint = this._biome(cx, cy);
    let c = this.pool.pop();
    if (!c) {                                   // create once, then RECYCLE forever
      this._everCreated++;
      const container = this.add.container(0, 0);
      const ground = this.add.tileSprite(0, 0, CHUNK_PX, CHUNK_PX, 'proto_tile').setOrigin(0, 0);
      const grid = this.add.grid(0, 0, CHUNK_PX, CHUNK_PX, TILE * 4, TILE * 4, undefined, 0, 0x000000, 0.18).setOrigin(0, 0).setVisible(false);
      const props = [];
      for (let i = 0; i < PROPS_PER_CHUNK; i++) props.push(this.add.image(0, 0, 'proto_tree'));
      container.add([ground, grid, ...props]);
      c = { container, ground, grid, props, cx, cy };
    }
    // position + dress this chunk (recycled or new)
    c.cx = cx; c.cy = cy;
    c.container.setPosition(ox, oy).setVisible(true).setActive(true);
    c.ground.setTint(tint);
    c.grid.setVisible(this.showGrid);
    const rnd = mulberry32(((cx * 73856093) ^ (cy * 19349663)) >>> 0);
    for (const p of c.props) {
      const isTree = rnd() > 0.4;
      p.setTexture(isTree ? 'proto_tree' : 'proto_rock')
        .setPosition(rnd() * CHUNK_PX, rnd() * CHUNK_PX)
        .setTint(isTree ? 0x2f6d3a : 0x6b6b76)
        .setDepth(oy + p.y).setVisible(true).setActive(true);
    }
    this.chunks.set(k, c);
  }

  _release(k, c) {                              // recycle, don't destroy (POOLING)
    c.container.setVisible(false).setActive(false);
    this.chunks.delete(k);
    this.pool.push(c);
  }
  _redrawAllGrids() { for (const c of this.chunks.values()) c.grid.setVisible(this.showGrid); }

  // ---- perf -----------------------------------------------------------------
  _resetPerf() { this._ring = new Array(120).fill(16.7); this._ri = 0; this._maxMs = 0; this._drops = 0; this._loadSpikes = 0; this._everCreated = this._everCreated || 0; }
  _avg() { let s = 0; for (const v of this._ring) s += v; return s / this._ring.length; }

  update(time, delta) {
    // movement in WORLD COORDS
    const k = this.keys, sp = (k.SHIFT.isDown ? 920 : 320);
    let vx = 0, vy = 0;
    if (this.auto) {                            // auto-stress: sprint a big loop across many seams
      this._autoT += delta / 1000; const a = this._autoT * 0.5;
      vx = Math.cos(a) * 920; vy = Math.sin(a * 1.3) * 920;
    } else {
      if (k.A.isDown || k.LEFT.isDown) vx -= sp; if (k.D.isDown || k.RIGHT.isDown) vx += sp;
      if (k.W.isDown || k.UP.isDown) vy -= sp; if (k.S.isDown || k.DOWN.isDown) vy += sp;
    }
    this.player.body.setVelocity(vx, vy);
    this.player.setDepth(1e6 + this.player.y);

    // RESTREAM only when the player crosses into a new chunk (cheap)
    const pcx = Math.floor(this.player.x / CHUNK_PX), pcy = Math.floor(this.player.y / CHUNK_PX);
    const pc = key(pcx, pcy);
    if (pc !== this._lastChunk) { this._lastChunk = pc; this._restream(false); }
    this._drainQueue();                         // budgeted instantiation each frame

    // perf sampling: record frame delta; flag drops + load-frame spikes
    this._ring[this._ri] = delta; this._ri = (this._ri + 1) % this._ring.length;
    if (delta > this._maxMs) this._maxMs = delta;
    if (delta > 33) { this._drops++; if (this._loadedThisFrame > 0) this._loadSpikes++; }

    if ((time | 0) % 6 === 0) this._drawHud();
  }

  _drawHud() {
    const fps = Math.round(this.game.loop.actualFps);
    const avg = this._avg(), pcx = Math.floor(this.player.x / CHUNK_PX), pcy = Math.floor(this.player.y / CHUNK_PX);
    const active = this.chunks.size * (PROPS_PER_CHUNK + 2);
    this.hud.setText([
      `FPS ${fps}   frame avg ${avg.toFixed(1)}ms  max ${this._maxMs.toFixed(1)}ms`,
      `dropped(>33ms) ${this._drops}   of-which-on-load ${this._loadSpikes}`,
      `chunks loaded ${this.chunks.size}/${WORLD_CHUNKS * WORLD_CHUNKS}  pooled ${this.pool.length}  ever-created ${this._everCreated}`,
      `~active objects ${active}   load budget ${LOAD_BUDGET}/frame   queue ${this.loadQueue.length}`,
      `world ${WORLD_PX}px  pos ${this.player.x | 0},${this.player.y | 0}  chunk ${pcx},${pcy}  ${this.auto ? 'AUTO-RUN' : ''}`,
    ].join('\n'));
  }
}
