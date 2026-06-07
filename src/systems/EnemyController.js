// =============================================================================
// SYSTEM: EnemyController  (renders + drives ANY Monsters archetype, written once).
// The behaviour is the tested FSM (src/systems/Monsters.js); this is the RENDER +
// MOVEMENT + VISUAL-LANGUAGE + player-counter glue, driven entirely by the FSM's
// flags/state — so every archetype becomes a distinct fight by DATA, and each
// archetype's intended COUNTER actually works in play (Gate E):
//   charger/brute/jumper/electric -> dodge the telegraph (PlayerCombat i-frames)
//   shielded -> FLANK (front is blocked)        caster -> INTERRUPT the channel
//   ranged   -> close / block the volley        swarm  -> AoE swing clears many
//   electric -> WAIT for the window (striking the charge recoils on you)
// Feel values are inherited from COMBAT (standards) — never re-tuned here.
// =============================================================================

import { spawn as spawnMonster } from './Monsters.js';
import { Character } from './Character.js';
import { DepthSort, DEPTH } from './DepthSort.js';
import { COMBAT } from '../constants/standards.js';
import { CHAR_FOOTPRINT, TILE } from '../data/assets.js';
import { ENEMY_SKINS, BOSS_SKINS } from '../data/enemies.js';

const FACE = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const F = Math.round(COMBAT.FLASH_MS / 16);

export class EnemyController {
  // opts.onPlayerHit(dmg, { fromFront, dir }) -> the scene resolves dodge/block/parry
  // opts.onPlayerRecoil(dmg) -> shock-back when the player hits an invulnerable charge
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.onPlayerHit = opts.onPlayerHit || (() => 'hit');
    this.onPlayerRecoil = opts.onPlayerRecoil || (() => {});
    this.solids = opts.solids || null;
    this.enemies = [];
    this.telegraphG = scene.add.graphics().setDepth(DEPTH.FLOOR + 5);   // ground tells
    this.fxG = scene.add.graphics().setDepth(DEPTH.OVERLAY);            // shimmers/rings/bars
    this.projectiles = [];
    this._safe = null;                 // a peaceful hub: { x, y, r } — no aggro inside
    this.indicators = false;           // threat indicators (chevrons) — off by default
    this.intuition = false;            // ENEMY INTUITION skill — always-on + enhanced
    if (scene.uiCamera) { scene.uiCamera.ignore(this.telegraphG); scene.uiCamera.ignore(this.fxG); }
  }

  /** Mark a peaceful hub (a town inside a combat region): enemies don't aggro there. */
  setSafeZone(x, y, r) { this._safe = { x, y, r }; }
  _inSafe(x, y) { return this._safe && Math.hypot(x - this._safe.x, y - this._safe.y) < this._safe.r; }

  /** Spawn an archetype (or boss) at a tile. Returns the enemy record. */
  spawn(id, { tx, ty, hp, boss = false, name, aggro = 230 } = {}) {
    const skin = (boss ? BOSS_SKINS[id] : ENEMY_SKINS[id]) || ENEMY_SKINS.charger;
    const x = tx * TILE + TILE / 2, y = ty * TILE + TILE / 2;
    let spr, foot;
    if (skin.sheet) {                                   // a REAL LPC monster sprite
      spr = this.scene.physics.add.sprite(x, y, `mon_${skin.sheet}`).setOrigin(0.5, 0.72);
      spr.facing = 'down'; spr.setState = () => {};     // no-op so the shared behaviour code is sprite-safe
      spr.play(`mon_${skin.sheet}_down`);               // start facing the player (usually below); turns by facing
      spr.body.setSize(26, 20, true);
      foot = spr.height * 0.22;
    } else {                                            // humanoid (kept for future humanoid enemies)
      spr = new Character(this.scene, x, y, { parts: skin.parts, facing: 'down', speed: 0, expression: 'angry' });
      if (skin.weapon) spr.equip(skin.weapon);
      foot = CHAR_FOOTPRINT.offY;
    }
    spr.setScale(skin.scale, skin.scale);
    DepthSort.track(spr, foot * skin.scale);
    if (this.scene.uiCamera) this.scene.uiCamera.ignore(spr);
    if (this.solids) this.scene.physics.add.collider(spr, this.solids);
    const mon = spawnMonster(id, hp != null ? { hp } : {});
    const e = {
      id, mon, spr, skin, boss, name: name || skin.name, base: skin.base,
      stats: this._lookupStats(id), maxCount: mon.count, homeX: x, homeY: y, aggro: boss ? 9999 : aggro,
      lastState: null, atkDir: { x: 0, y: 1 }, landX: x, landY: y, hitThisAtk: false, firedThis: false,
      knockFrames: 0, knockVx: 0, knockVy: 0, flashFrames: 0, popFrames: 0, staggerFrames: 0, alive: true, scale: skin.scale,
    };
    this.enemies.push(e);
    return e;
  }

  get live() { return this.enemies.filter((e) => e.alive); }
  nearest(player) {
    let best = null, bd = Infinity;
    for (const e of this.live) { const d = Math.hypot(e.spr.x - player.x, e.spr.y - player.y); if (d < bd) { bd = d; best = e; } }
    return best;
  }

  // ---- the loop -------------------------------------------------------------
  update(dt, player) {
    this.telegraphG.clear(); this.fxG.clear();
    for (const e of this.enemies) if (e.alive) this._stepEnemy(dt, e, player);
    this._stepProjectiles(player);
    for (const e of this.live) this._drawHpBar(e);
    if (this.indicators) for (const e of this.live) if (this._showIndicator(e, player)) this._drawThreatIndicator(e);
  }

  _stepEnemy(dt, e, player) {
    const spr = e.spr, mon = e.mon;
    if (e.staggerFrames > 0) {                       // parried -> frozen + vulnerable
      e.staggerFrames--; spr.body.setVelocity(0, 0); spr.setState('idle'); e.lastState = 'stagger';
      this._tint(e, e.flashFrames-- > 0 ? 0xffffff : 0x66ccff); return;
    }
    // SAFE ZONE: a settlement inside a combat region — enemies don't aggro/enter it
    if (this._safe && (this._inSafe(player.x, player.y) || this._inSafe(spr.x, spr.y))) {
      mon.state = mon.fsm.start; mon.elapsed = 0; e.lastState = null; e.awake = false;
      if (this._inSafe(spr.x, spr.y)) { const a = Math.atan2(e.homeY - spr.y, e.homeX - spr.x); spr.body.setVelocity(Math.cos(a) * 50, Math.sin(a) * 50); spr.facing = this._vecFace(Math.cos(a), Math.sin(a)); }
      else spr.body.setVelocity(0, 0);
      spr.setState('idle'); spr.setScale(e.scale); this._tint(e, e.base);
      if (!spr.list) this._faceAnim(e);
      return;
    }
    // AGGRO: a placed enemy only wakes when the player comes near (discrete encounter)
    if (!e.awake) {
      if (Math.hypot(spr.x - player.x, spr.y - player.y) > e.aggro) {
        mon.state = mon.fsm.start; mon.elapsed = 0; e.lastState = null;
        spr.body.setVelocity(0, 0); spr.setState('idle'); spr.setScale(e.scale); this._tint(e, e.base);
        return;
      }
      e.awake = true;
    }
    mon.update(dt);
    const st = mon.state;
    if (st !== e.lastState) this._onEnter(e, st, player);
    e.lastState = st;

    if (e.knockFrames > 0) { e.knockFrames--; spr.body.setVelocity(e.knockVx, e.knockVy); e.knockVx *= 0.8; e.knockVy *= 0.8; }
    else this._behave(e, player);

    // ---- visual language (flag-driven) ----
    let tint = e.base;
    if (mon.isTelegraphing()) { tint = mon.isInvulnerable() ? 0x8fd0ff : 0xffd23f; this._drawTelegraph(e, player); }
    else if (mon.isInvulnerable()) tint = 0x8fd0ff;
    else if (mon.isGuarding()) { tint = 0xbfd4e6; this._drawGuard(e); }
    else if (mon.inPunishWindow()) tint = 0x66ccff;
    else if (this._attacking(mon)) tint = 0xffffff;
    if (e.flashFrames > 0) { tint = 0xffffff; e.flashFrames--; }
    // HIT-POP: a brief squash-punch on a landed hit so the strike reads as LANDING.
    const pop = e.popFrames > 0 ? (1 + (COMBAT.HIT_POP_SCALE - 1) * (e.popFrames-- / 6)) : 1;
    spr.setScale(e.scale * pop * (mon.isTelegraphing() && !mon.isInvulnerable() ? 1.08 : 1));
    this._tint(e, tint);
    if (!spr.list) this._faceAnim(e);                  // monster sprite: turn its sheet to the facing row
  }

  // play the directional animation matching the monster's facing (only on change)
  _faceAnim(e) {
    const anim = `mon_${e.skin.sheet}_${e.spr.facing}`;
    if (e._curAnim === anim) return;
    if (this.scene.anims.exists(anim)) { e.spr.play(anim, true); e._curAnim = anim; }
  }
  _vecFace(vx, vy) { if (Math.abs(vx) >= Math.abs(vy)) return vx < 0 ? 'left' : 'right'; return vy < 0 ? 'up' : 'down'; }

  _attacking(mon) { return ['rushing', 'slamming', 'leaping', 'firing', 'casting', 'discharging', 'swarming'].some((f) => mon.flag(f)); }

  _onEnter(e, st, player) {
    const mon = e.mon, spr = e.spr;
    // lock the attack direction at the START of a directional attack
    if (mon.flag('rushing') || mon.flag('slamming') || mon.flag('leaping')) {
      const a = Math.atan2(player.y - spr.y, player.x - spr.x);
      e.atkDir = { x: Math.cos(a), y: Math.sin(a) };
      e.landX = player.x; e.landY = player.y; e.hitThisAtk = false;
    }
    if (mon.flag('firing')) e.firedThis = false;
  }

  _behave(e, player) {
    const mon = e.mon, spr = e.spr, stats = e.stats;
    const toP = Math.atan2(player.y - spr.y, player.x - spr.x);
    const dist = Math.hypot(player.x - spr.x, player.y - spr.y);
    // FACING: face the charge/leap direction while attacking, else face the player
    if (mon.flag('rushing') || mon.flag('slamming') || mon.flag('leaping')) spr.facing = this._vecFace(e.atkDir.x, e.atkDir.y);
    else spr.facing = this._face(spr, player);

    if (mon.flag('rushing')) {                       // charger rush
      spr.body.setVelocity(e.atkDir.x * COMBAT.CHARGE_SPEED, e.atkDir.y * COMBAT.CHARGE_SPEED); spr.setState('walk');
      this._contact(e, player, COMBAT.CHARGE_DAMAGE, 40);
    } else if (mon.flag('slamming')) {               // brute slam (heavy, short)
      spr.body.setVelocity(e.atkDir.x * COMBAT.CHARGE_SPEED * 0.8, e.atkDir.y * COMBAT.CHARGE_SPEED * 0.8); spr.setState('walk');
      this._contact(e, player, Math.round(COMBAT.CHARGE_DAMAGE * 1.5), 48);
    } else if (mon.flag('leaping')) {                // jumper leap to the locked landing
      const a = Math.atan2(e.landY - spr.y, e.landX - spr.x);
      spr.body.setVelocity(Math.cos(a) * COMBAT.CHARGE_SPEED, Math.sin(a) * COMBAT.CHARGE_SPEED); spr.setState('walk');
      this._contact(e, player, COMBAT.CHARGE_DAMAGE, 36);
    } else if (mon.flag('firing') && !e.firedThis) { // ranged shot
      e.firedThis = true; this._fire(e, player, Math.round(COMBAT.CHARGE_DAMAGE * 0.6));
      spr.body.setVelocity(0, 0); spr.setState('idle');
    } else if (mon.flag('casting')) {                // caster release (if not interrupted)
      spr.body.setVelocity(0, 0); spr.setState('idle');
      if (!e.hitThisAtk) { e.hitThisAtk = true; this._castHit(e, player, COMBAT.CHARGE_DAMAGE); }
    } else if (mon.flag('swarming')) {               // swarm drift in + nibble
      spr.body.setVelocity(Math.cos(toP) * stats.speed * 1.3, Math.sin(toP) * stats.speed * 1.3); spr.setState('walk');
      this._contact(e, player, Math.max(2, Math.round(COMBAT.CHARGE_DAMAGE * 0.25)), 30);
    } else if (mon.isTelegraphing() || mon.isInvulnerable() || mon.flag('discharging')) {
      spr.body.setVelocity(0, 0); spr.setState('idle');     // wind-up / charged / discharge: planted
    } else if (mon.isGuarding()) {                   // shielded: advance slowly behind the shield
      spr.body.setVelocity(Math.cos(toP) * stats.speed * 8, Math.sin(toP) * stats.speed * 8); spr.setState('walk');
    } else if (mon.inPunishWindow()) {               // vulnerable opening: a quick jab then planted
      if (e.id === 'shielded' && !e.hitThisAtk && dist < 44) { e.hitThisAtk = true; this._contact(e, player, e.stats.dmg, 44); }
      spr.body.setVelocity(0, 0); spr.setState('idle');
    } else if (e.id === 'ranged' && dist < 120) {    // ranged kites away when crowded
      spr.body.setVelocity(-Math.cos(toP) * stats.speed * 9, -Math.sin(toP) * stats.speed * 9); spr.setState('walk');
    } else if (e.id === 'caster') {                  // caster holds position
      spr.body.setVelocity(0, 0); spr.setState('idle');
    } else {                                         // idle/cooldown: approach
      spr.body.setVelocity(Math.cos(toP) * COMBAT.APPROACH_SPEED, Math.sin(toP) * COMBAT.APPROACH_SPEED); spr.setState('walk');
      if (mon.inPunishWindow()) e.hitThisAtk = false;
    }
  }

  _face(from, to) { const dx = to.x - from.x, dy = to.y - from.y; if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right'; return dy < 0 ? 'up' : 'down'; }
  _lookupStats(id) {
    // small inline table mirroring src/data/monsters stats (speed/dmg) for movement feel
    const T = { charger: { speed: 4, dmg: 8 }, shielded: { speed: 2, dmg: 6 }, ranged: { speed: 2, dmg: 7 }, swarm: { speed: 3, dmg: 3 }, brute: { speed: 1, dmg: 16 }, caster: { speed: 2, dmg: 14 }, charger_electric: { speed: 3, dmg: 12 }, jumper: { speed: 5, dmg: 9 }, drowned_guardian: { speed: 2, dmg: 14 } };
    return T[id] || { speed: 3, dmg: 8 };
  }

  _contact(e, player, dmg, range) {
    if (e.hitThisAtk) return;
    if (Math.hypot(e.spr.x - player.x, e.spr.y - player.y) < range) {
      e.hitThisAtk = true;
      const f = FACE[player.facing] || FACE.down;
      const tx = e.spr.x - player.x, ty = e.spr.y - player.y, tl = Math.hypot(tx, ty) || 1;
      const fromFront = (tx / tl) * f.x + (ty / tl) * f.y > 0.3;
      this.onPlayerHit(dmg, { fromFront, dir: e.atkDir });
    }
  }

  // ---- projectiles (ranged) -------------------------------------------------
  _fire(e, player, dmg) {
    const a = Math.atan2(player.y - e.spr.y, player.x - e.spr.x);
    const dot = this.scene.add.circle(e.spr.x, e.spr.y - 8, 6, 0xb6e0ff).setStrokeStyle(2, 0x2b6fb0).setDepth(DEPTH.OVERLAY);
    if (this.scene.uiCamera) this.scene.uiCamera.ignore(dot);
    this.projectiles.push({ dot, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, dmg, life: 90 });
  }
  _stepProjectiles(player) {
    for (const p of this.projectiles) {
      p.dot.x += p.vx / 60; p.dot.y += p.vy / 60; p.life--;
      if (Math.hypot(p.dot.x - player.x, p.dot.y - (player.y - 18)) < 22) {
        const a = Math.atan2(p.vy, p.vx), f = FACE[player.facing] || FACE.down;
        const fromFront = -(Math.cos(a) * f.x + Math.sin(a) * f.y) > 0.1;   // facing the incoming shot
        this.onPlayerHit(p.dmg, { fromFront, dir: { x: Math.cos(a), y: Math.sin(a) } });
        p.life = 0;
      }
    }
    this.projectiles = this.projectiles.filter((p) => { if (p.life <= 0) { p.dot.destroy(); return false; } return true; });
  }
  _castHit(e, player, dmg) {
    if (Math.hypot(e.spr.x - player.x, e.spr.y - player.y) < 180) {
      const f = FACE[player.facing] || FACE.down, tx = e.spr.x - player.x, ty = e.spr.y - player.y, tl = Math.hypot(tx, ty) || 1;
      this.onPlayerHit(dmg, { fromFront: (tx / tl) * f.x + (ty / tl) * f.y > 0.3, dir: { x: tx / tl, y: ty / tl } });
    }
  }

  // ---- the player acting on enemies (counters) ------------------------------
  /** A melee swing. Returns the resolved outcome(s). opts.tool for the lantern trick. */
  playerAttack(player, dmg, opts = {}) {
    const f = FACE[player.facing] || FACE.down;
    const inArc = this.live.filter((e) => {
      const dx = e.spr.x - player.x, dy = e.spr.y - player.y, d = Math.hypot(dx, dy) || 1;
      return d <= COMBAT.ATTACK_RANGE * Math.max(1, e.scale) && (dx / d) * f.x + (dy / d) * f.y >= COMBAT.ATTACK_ARC_DOT;
    });
    if (!inArc.length) return [];
    const swarmCount = inArc.filter((e) => e.mon.count > 1).length;
    const out = [];
    for (const e of inArc) {
      // CASTER counter: a hit while it channels INTERRUPTS it
      if (e.mon.canBeInterrupted()) { e.mon.interrupt(); out.push({ e, outcome: 'interrupted' }); this._flash(e); continue; }
      const angle = this._angleTo(e, player);                    // 'flank' bypasses a guard
      const aoe = e.mon.count > 1;                                // swarm: clear several per swing
      const r = e.mon.hit(dmg, { angle, tool: opts.tool, aoe, aoeCount: 99 });
      if (r.reason === 'invulnerable') { this.onPlayerRecoil(r.recoil || e.stats.dmg); out.push({ e, outcome: 'recoil' }); continue; }
      if (r.blocked) { out.push({ e, outcome: r.reason }); this._guardSpark(e); continue; }
      // a clean hit (or swarm kills)
      this._flash(e);
      const nx = (e.spr.x - player.x) || 0.01, ny = (e.spr.y - player.y) || 0;
      const nl = Math.hypot(nx, ny) || 1; e.knockVx = (nx / nl) * COMBAT.KNOCKBACK_SPEED; e.knockVy = (ny / nl) * COMBAT.KNOCKBACK_SPEED; e.knockFrames = COMBAT.KNOCKBACK_FRAMES;
      if (e.mon.dead) this._die(e);
      out.push({ e, outcome: r.swarmKilled ? 'swarm' : 'hit', killed: e.mon.dead });
    }
    return out;
  }
  /** Parry success: stagger the target into a long punish window. */
  stagger(e) { e.staggerFrames = Math.round(COMBAT.PARRY_STUN_MS / 16); e.flashFrames = 8; }

  _angleTo(e, player) {
    const ef = FACE[e.spr.facing] || FACE.down;                  // the enemy's facing
    const tx = player.x - e.spr.x, ty = player.y - e.spr.y, tl = Math.hypot(tx, ty) || 1;
    return (tx / tl) * ef.x + (ty / tl) * ef.y > 0.2 ? 'front' : 'flank';   // in front of it = front, else flank
  }

  // ---- visuals --------------------------------------------------------------
  _drawTelegraph(e, player) {
    const spr = e.spr, mon = e.mon;
    if (mon.isInvulnerable()) {                       // electric: a "do NOT hit" shimmer ring
      const r = 26 * e.scale + (e.flashFrames % 2 ? 3 : 0);
      this.fxG.lineStyle(3, 0x8fd0ff, 0.9).strokeCircle(spr.x, spr.y - 16 * e.scale, r);
      return;
    }
    if (e.id === 'caster') {                          // channel: a growing interrupt ring
      const f = 1 - (mon._cur().dur ? (mon._cur().dur - mon.elapsed) / mon._cur().dur : 0);
      this.fxG.lineStyle(4, 0xc78aff, 0.85).strokeCircle(spr.x, spr.y - 16 * e.scale, 10 + 22 * f);
      return;
    }
    // directional tell (charger/brute/jumper/ranged-aim): a line toward the player
    const a = Math.atan2(player.y - spr.y, player.x - spr.x);
    const len = e.id === 'ranged' ? 360 : (e.id === 'brute' ? 240 : 300);
    const col = e.id === 'ranged' ? 0xffd23f : 0xff5a3c;
    const bx = spr.x, by = spr.y + 14, ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
    this.telegraphG.lineStyle(10, col, 0.45).beginPath().moveTo(bx, by).lineTo(ex, ey).strokePath();
    const ah = 16, pa = a + Math.PI * 0.85, pb = a - Math.PI * 0.85;
    this.telegraphG.fillStyle(col, 0.6).fillTriangle(ex, ey, ex + Math.cos(pa) * ah, ey + Math.sin(pa) * ah, ex + Math.cos(pb) * ah, ey + Math.sin(pb) * ah);
  }
  _drawGuard(e) {                                     // shielded: a front guard arc
    const spr = e.spr, f = FACE[spr.facing] || FACE.down, ang = Math.atan2(f.y, f.x);
    this.fxG.lineStyle(6, 0x9fd8ff, 0.85).beginPath().arc(spr.x + f.x * 18 * e.scale, spr.y + f.y * 18 * e.scale - 6, 20 * e.scale, ang - 0.9, ang + 0.9).strokePath();
  }
  _guardSpark(e) { this.fxG.lineStyle(3, 0xffffff, 0.9).strokeCircle(e.spr.x, e.spr.y - 16 * e.scale, 14 * e.scale); }
  _drawHpBar(e) {
    const spr = e.spr, w = 44 * e.scale, x = spr.x - w / 2;
    const top = spr.list ? 52 * e.scale : spr.displayHeight * 0.55 + 4;   // humanoid vs monster sprite
    const y = spr.y - top;
    const frac = e.maxCount > 1 ? e.mon.count / e.maxCount : Math.max(0, e.mon.hp / e.mon.maxHp);
    this.fxG.fillStyle(0x000000, 0.55).fillRect(x - 1, y - 1, w + 2, 7);
    this.fxG.fillStyle(0x3a1418, 1).fillRect(x, y, w, 5);
    this.fxG.fillStyle(e.boss ? 0xb05ad0 : 0xe05a5a, 1).fillRect(x, y, w * frac, 5);
  }
  // THREAT INDICATOR: a chevron over a threat. Toggle -> only engaged (awake) enemies;
  // ENEMY INTUITION skill -> all nearby enemies, in a brighter "sensed" colour.
  _showIndicator(e, player) {
    if (this.intuition) return Math.hypot(e.spr.x - player.x, e.spr.y - player.y) < 420;
    return e.awake;
  }
  _drawThreatIndicator(e) {
    const spr = e.spr, top = spr.list ? 62 * e.scale : spr.displayHeight * 0.55 + 16;
    const y = spr.y - top, col = this.intuition ? 0xff6a6a : 0xffd23f;
    this.fxG.fillStyle(0x000000, 0.5).fillTriangle(spr.x - 9, y - 1, spr.x + 9, y - 1, spr.x, y + 11);
    this.fxG.fillStyle(col, 0.95).fillTriangle(spr.x - 7, y, spr.x + 7, y, spr.x, y + 9);
  }
  _flash(e) { e.flashFrames = F; e.popFrames = 6; }   // white flash + a squash-punch
  _tint(e, c) { const s = e.spr; if (s.list) s.list.forEach((x) => x.setTint && x.setTint(c)); else s.setTint(c); }
  // DEATH POP — a satisfying beat: a death cue, an expanding shock ring + debris
  // specks, a white pop, then the fade. (FLAG: a dedicated sfx_death CC0 cue would
  // beat reusing sfx_hit; the FX are pooled-cheap graphics, destroyed on complete.)
  _die(e) {
    e.alive = false;
    const spr = e.spr, x = spr.x, y = spr.y - 14 * e.scale, s = e.scale;
    if (this.scene._sfx) this.scene._sfx('sfx_hit', 0.9);
    const ring = this.scene.add.graphics().setDepth(DEPTH.OVERLAY - 5);
    if (this.scene.uiCamera) this.scene.uiCamera.ignore(ring);
    this.scene.tweens.addCounter({ from: 0, to: 1, duration: 240, onUpdate: (tw) => { const f = tw.getValue(); ring.clear(); ring.lineStyle(3 * (1 - f) + 1, 0xfff2c4, 0.85 * (1 - f)); ring.strokeCircle(x, y, 6 + 34 * s * f); }, onComplete: () => ring.destroy() });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3, d = (18 + (i % 3) * 8) * s;
      const p = this.scene.add.rectangle(x, y, 3, 3, 0xe8d8b0).setDepth(DEPTH.OVERLAY - 5);
      if (this.scene.uiCamera) this.scene.uiCamera.ignore(p);
      this.scene.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d + 6, alpha: 0, scale: 0.4, duration: 300, ease: 'Quad.easeOut', onComplete: () => p.destroy() });
    }
    if (spr.list) spr.list.forEach((l) => l.setTintFill && l.setTintFill(0xffffff));
    this.scene.tweens.add({ targets: spr.list || spr, alpha: 0, duration: 300, delay: 60, onComplete: () => spr.destroy() });
  }
  destroyAll() { this.enemies.forEach((e) => e.spr.destroy()); this.enemies = []; this.projectiles.forEach((p) => p.dot.destroy()); this.projectiles = []; this.telegraphG.destroy(); this.fxG.destroy(); }
}
