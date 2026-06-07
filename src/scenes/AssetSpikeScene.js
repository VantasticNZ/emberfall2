// =============================================================================
// ⚠ THROWAWAY / EXPERIMENTAL — ASSET-LOAD SPIKE (world-migration pre-Phase-1 de-risk).
// Closes the ONE thing Phase 0 (PrototypeScene) did NOT test: streaming REAL art
// (PNG/atlas DECODE from disk + GPU texture UPLOAD) mid-game as chunks load — the
// runtime-generated textures in Phase 0 skipped that cost. Per WORLD-STRUCTURE-DESIGN
// Pillar 1 (the flagged asset-load unknown).
//
// THE COST UNDER TEST: when a real texture enters the cache and is first DRAWN, the
// browser decodes the PNG and WebGL uploads it to the GPU on the MAIN THREAD — a big
// atlas (lpc_terrain = 8MB decoded RGBA) is where a hitch would show.
//
// METHOD: stream the real lpc_terrain atlas (+ a structure PNG) per chunk under
// CACHE-BUSTED keys (?c=<chunk>) so Phaser genuinely re-decodes + re-uploads each
// time (worst realistic case), and measure frame-time on the upload frames. Modes
// compare STREAM vs RESIDENT vs upload-BUDGET. Isolated; touches no real region.
// Reached via window.__EMBER.scene.start('AssetSpike'). Delete after the go/no-go.
// =============================================================================

import Phaser from 'phaser';

const TILE = 32, CHUNK = 32, CHUNK_PX = CHUNK * TILE;
const WORLD_CHUNKS = 12, WORLD_PX = WORLD_CHUNKS * CHUNK_PX;
const LOAD_RING = 2, UNLOAD_RING = 3;
const ATLAS = 'art/terrain/lpc_terrain.png';          // 1024×2048 = 8.0MB decoded RGBA (the heavy one)
const STRUCT = 'art/structures/house_brick_a.png';    // a smaller real PNG too
const key = (cx, cy) => `${cx},${cy}`;

export class AssetSpikeScene extends Phaser.Scene {
  constructor() { super('AssetSpike'); }

  create() {
    this.cameras.main.setBackgroundColor('#0c1018');
    this.physics.world.setBounds(0, 0, WORLD_PX, WORLD_PX);
    this.cameras.main.setBounds(0, 0, WORLD_PX, WORLD_PX);

    // a yellow player dot (generated — not the thing under test)
    const g = this.make.graphics({ add: false }); g.fillStyle(0xffe66d, 1).fillCircle(11, 11, 10).lineStyle(2, 0, 1).strokeCircle(11, 11, 10); g.generateTexture('spike_player', 22, 22); g.destroy();
    this.player = this.physics.add.sprite(WORLD_PX / 2, WORLD_PX / 2, 'spike_player').setDepth(1e6);
    this.cameras.main.startFollow(this.player, true, 0.16, 0.16);

    this.chunks = new Map();           // key -> { img, struct, cx, cy, texKey, structKey }
    this.pool = [];
    this.loadQueue = [];
    this._lastChunk = null;
    this.mode = 'STREAM';              // STREAM (real decode/upload per chunk) | RESIDENT (load once, reuse)
    this.freeOnUnload = true;          // remove GPU textures when a chunk unloads (streaming) vs accumulate
    this.uploadBudget = 1;             // max NEW textures applied (-> first-draw upload) per frame
    this._decodes = 0; this._pendingApply = [];

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,O');
    this.input.keyboard.on('keydown-M', () => { this.mode = this.mode === 'STREAM' ? 'RESIDENT' : 'STREAM'; this._wipe(); this._resetPerf(); this._restream(true); });
    this.input.keyboard.on('keydown-U', () => { this.freeOnUnload = !this.freeOnUnload; });
    this.input.keyboard.on('keydown-B', () => { this.uploadBudget = this.uploadBudget >= 99 ? 1 : 99; this._resetPerf(); });
    this.input.keyboard.on('keydown-R', () => this._resetPerf());
    this.input.keyboard.on('keydown-O', () => { this.auto = !this.auto; this._autoT = 0; });

    // texture decode complete -> queue the APPLY (first-draw triggers the GPU upload)
    this.load.on('filecomplete', (k) => { if (k.startsWith('spk_')) { this._decodes++; this._pendingApply.push(k); } });

    this._resetPerf(); this.auto = false; this._autoT = 0;
    this.hud = this.add.text(8, 8, '', { fontFamily: 'monospace', fontSize: '13px', color: '#bfe8ff', backgroundColor: '#000a', padding: { x: 6, y: 4 } }).setScrollFactor(0).setDepth(2e6);
    this.add.text(8, 408, "ASSET-SPIKE (throwaway). WASD/arrows · SHIFT sprint · O auto-run · M STREAM/RESIDENT · U free-on-unload · B upload-budget · R reset", { fontFamily: 'monospace', fontSize: '11px', color: '#88aa99', backgroundColor: '#000a', padding: { x: 4, y: 2 } }).setScrollFactor(0).setDepth(2e6);

    this._restream(true);
    this.perf = () => ({ mode: this.mode, fps: Math.round(this.game.loop.actualFps), avgMs: +this._avg().toFixed(2), maxMs: +this._maxMs.toFixed(2), maxLoadFrameMs: +this._maxLoadMs.toFixed(2), drops: this._drops, loadSpikes: this._loadSpikes, decodes: this._decodes, loaded: this.chunks.size, texturesInCache: this.textures.list ? Object.keys(this.textures.list).length : 0, freeOnUnload: this.freeOnUnload, uploadBudget: this.uploadBudget });
  }

  _resetPerf() { this._ring = new Array(120).fill(16.7); this._ri = 0; this._maxMs = 0; this._maxLoadMs = 0; this._drops = 0; this._loadSpikes = 0; }
  _avg() { let s = 0; for (const v of this._ring) s += v; return s / this._ring.length; }

  _restream(immediate = false) {
    const pcx = Math.floor(this.player.x / CHUNK_PX), pcy = Math.floor(this.player.y / CHUNK_PX);
    for (const [k, c] of this.chunks) if (Math.max(Math.abs(c.cx - pcx), Math.abs(c.cy - pcy)) > UNLOAD_RING) this._release(k, c);
    for (let dy = -LOAD_RING; dy <= LOAD_RING; dy++) for (let dx = -LOAD_RING; dx <= LOAD_RING; dx++) {
      const cx = pcx + dx, cy = pcy + dy;
      if (cx < 0 || cy < 0 || cx >= WORLD_CHUNKS || cy >= WORLD_CHUNKS) continue;
      const k = key(cx, cy);
      if (this.chunks.has(k) || this.loadQueue.some((q) => q.k === k)) continue;
      this.loadQueue.push({ k, cx, cy, d: Math.max(Math.abs(dx), Math.abs(dy)) });
    }
    this.loadQueue.sort((a, b) => a.d - b.d);
    if (immediate) { while (this.loadQueue.length) this._spawn(this.loadQueue.shift()); }
  }

  // spawn a chunk: create the GameObjects, and (STREAM mode) kick a REAL texture load
  _spawn({ k, cx, cy }) {
    const ox = cx * CHUNK_PX, oy = cy * CHUNK_PX;
    let c = this.pool.pop();
    if (!c) { c = { img: this.add.image(0, 0, '__DEFAULT').setOrigin(0, 0), struct: this.add.image(0, 0, '__DEFAULT').setOrigin(0.5, 1), cx, cy, texKey: null, structKey: null }; }
    c.cx = cx; c.cy = cy;
    // reset to a SAFE built-in texture first — a recycled chunk whose streamed texture
    // was freed has a null frame, so setDisplaySize() would throw before re-texturing.
    c.img.setTexture('__WHITE').setPosition(ox, oy).setDisplaySize(CHUNK_PX, CHUNK_PX).setVisible(true).setActive(true).setTint(0x223044);
    c.struct.setTexture('__WHITE').setPosition(ox + CHUNK_PX / 2, oy + CHUNK_PX - 8).setVisible(true).setActive(true).setDepth(oy + CHUNK_PX);
    this.chunks.set(k, c);

    if (this.mode === 'RESIDENT') {                       // load the atlas ONCE under a shared key; reuse
      this._ensureResident(() => { c.img.setTexture('spk_resident_atlas').clearTint().setDisplaySize(CHUNK_PX, CHUNK_PX); c.struct.setTexture('spk_resident_struct'); });
    } else {                                              // STREAM: a fresh cache-busted key -> real decode + upload
      const tk = `spk_t_${k}_${cx}_${cy}`, sk = `spk_s_${k}`;
      c.texKey = tk; c.structKey = sk;
      if (!this.textures.exists(tk)) this.load.image(tk, `${ATLAS}?c=${tk}`);
      if (!this.textures.exists(sk)) this.load.image(sk, `${STRUCT}?c=${sk}`);
      if (!this.load.isLoading()) this.load.start();
    }
  }

  _ensureResident(then) {
    if (this.textures.exists('spk_resident_atlas')) return then();
    if (this._residentLoading) { this.load.once('complete', then); return; }
    this._residentLoading = true;
    this.load.image('spk_resident_atlas', ATLAS); this.load.image('spk_resident_struct', STRUCT);
    this.load.once('complete', () => { this._residentLoading = false; then(); });
    if (!this.load.isLoading()) this.load.start();
  }

  _release(k, c) {
    c.img.setVisible(false).setActive(false); c.struct.setVisible(false).setActive(false);
    if (this.mode === 'STREAM' && this.freeOnUnload) {       // free the GPU textures (streaming)
      if (c.texKey && this.textures.exists(c.texKey)) this.textures.remove(c.texKey);
      if (c.structKey && this.textures.exists(c.structKey)) this.textures.remove(c.structKey);
    }
    c.texKey = c.structKey = null;
    this.chunks.delete(k); this.pool.push(c);
  }

  _wipe() { for (const k of [...this.chunks.keys()]) this._release(k, this.chunks.get(k)); }

  update(time, delta) {
    const k = this.keys, sp = (k.SHIFT.isDown ? 760 : 300);
    let vx = 0, vy = 0;
    if (this.auto) { this._autoT += delta / 1000; vx = Math.cos(this._autoT * 0.5) * 760; vy = Math.sin(this._autoT * 1.3) * 760; }
    else { if (k.A.isDown || k.LEFT.isDown) vx -= sp; if (k.D.isDown || k.RIGHT.isDown) vx += sp; if (k.W.isDown || k.UP.isDown) vy -= sp; if (k.S.isDown || k.DOWN.isDown) vy += sp; }
    this.player.body.setVelocity(vx, vy); this.player.setDepth(1e6 + this.player.y);

    const pcx = Math.floor(this.player.x / CHUNK_PX), pcy = Math.floor(this.player.y / CHUNK_PX), pc = key(pcx, pcy);
    if (pc !== this._lastChunk) { this._lastChunk = pc; this._restream(false); }
    while (this.loadQueue.length) this._spawn(this.loadQueue.shift());   // creating GOs is cheap; the loader is async

    // APPLY decoded textures (budgeted) — first setTexture+draw triggers the GPU UPLOAD (the hitch source)
    let applied = 0;
    while (this._pendingApply.length && applied < this.uploadBudget) {
      const tk = this._pendingApply.shift(); applied++;
      for (const c of this.chunks.values()) {
        if (c.texKey === tk) { c.img.setTexture(tk).clearTint().setDisplaySize(CHUNK_PX, CHUNK_PX); break; }
        if (c.structKey === tk) { c.struct.setTexture(tk); break; }
      }
    }

    // perf: record frame delta; attribute spikes to APPLY (upload) frames
    this._ring[this._ri] = delta; this._ri = (this._ri + 1) % this._ring.length;
    if (delta > this._maxMs) this._maxMs = delta;
    if (applied > 0 && delta > this._maxLoadMs) this._maxLoadMs = delta;
    if (delta > 33) { this._drops++; if (applied > 0) this._loadSpikes++; }

    if ((time | 0) % 6 === 0) this._drawHud();
  }

  _drawHud() {
    const p = this.perf();
    this.hud.setText([
      `MODE ${p.mode}   FPS ${p.fps}   frame avg ${p.avgMs}ms  max ${p.maxMs}ms`,
      `MAX frame-time on a TEXTURE-UPLOAD frame: ${p.maxLoadFrameMs}ms   (dropped>33ms ${p.drops}, on-upload ${p.loadSpikes})`,
      `real decodes ${p.decodes}   textures in GPU cache ${p.texturesInCache}   loaded chunks ${p.loaded}`,
      `free-on-unload ${p.freeOnUnload}   upload budget ${p.uploadBudget}/frame   atlas = lpc_terrain 8.0MB RGBA`,
      `pos ${this.player.x | 0},${this.player.y | 0}  ${this.auto ? 'AUTO-RUN' : ''}`,
    ].join('\n'));
  }
}
