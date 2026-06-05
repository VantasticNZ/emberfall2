// =============================================================================
// GreenhollowScene — builds the proof slice ENTIRELY from data (world.js) using
// the write-once systems (Character, Movement, Collision, DepthSort,
// Interaction). The scene wires data into systems; it holds no per-actor
// behaviour. Characters are LPC paper-dolls; the Gate M demo equips gear live.
// =============================================================================

import Phaser from 'phaser';
import { WORLD } from '../data/world.js';
import { PROPS, PARTS, TILE, DIR_ROW, CHAR_FOOTPRINT } from '../data/assets.js';
import { AssetLoader } from '../art/AssetLoader.js';
import { Character } from '../systems/Character.js';
import { Movement } from '../systems/Movement.js';
import { Collision } from '../systems/Collision.js';
import { DepthSort, DEPTH } from '../systems/DepthSort.js';
import { Interaction } from '../systems/Interaction.js';

const tileToPx = (t) => t * TILE + TILE / 2;       // centre of a tile

export class GreenhollowScene extends Phaser.Scene {
  constructor() { super('Greenhollow'); }

  create() {
    AssetLoader.build(this);          // register every layer's animation set
    DepthSort.reset();
    Interaction.reset();

    const worldW = WORLD.widthTiles * TILE;
    const worldH = WORLD.heightTiles * TILE;
    this.physics.world.setBounds(0, 0, worldW, worldH);

    this._buildGround(worldW, worldH);
    this._scatterDecals();
    this.solids = this.add.group();
    this.actors = this.add.group();
    this._buildProps();
    this._buildNPCs();
    this._buildPlayer();

    Collision.wire(this, this.actors, this.solids);

    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
    this.cameras.main.setRoundPixels(true);

    // Zoom: 3 discrete levels; default is index 1 (slightly more zoomed out than 1:1).
    this.zoomLevels = [0.7, 0.85, 1.1];
    this.zoomIndex = 1;
    this.cameras.main.setZoom(this.zoomLevels[this.zoomIndex]);

    this._buildInput();
    this._buildUI();
    this._buildDebug();
  }

  // ---- GROUND (LPC terrain tiles, 32px native, tiled 1:1) -------------------
  _buildGround(worldW, worldH) {
    const paint = (key, x, y, w, h) => {
      const ts = this.add.tileSprite(x, y, w, h, key).setOrigin(0, 0);
      DepthSort.pinFloor(ts);
      return ts;
    };
    paint(WORLD.ground.base, 0, 0, worldW, worldH);
    for (const [key, tx, ty, w, h] of WORLD.ground.rects) {
      paint(key, tx * TILE, ty * TILE, w * TILE, h * TILE);
    }
  }

  // ---- GRASS DECALS (scattered off-grid, above floor, below actors) ---------
  _scatterDecals() {
    const cfg = WORLD.decals;
    if (!cfg) return;
    let seed = cfg.seed >>> 0;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const onGrass = (px, py) => {            // only over the grass base, not roads/pond
      const tx = px / TILE, ty = py / TILE;
      for (const [key, rx, ry, rw, rh] of WORLD.ground.rects) {
        if (key === 'tile_grass') continue;
        if (tx >= rx && tx < rx + rw && ty >= ry && ty < ry + rh) return false;
      }
      return true;
    };
    const W = WORLD.widthTiles * TILE, H = WORLD.heightTiles * TILE;
    let placed = 0, tries = 0;
    while (placed < cfg.count && tries < cfg.count * 10) {
      tries++;
      const px = Math.floor(rnd() * W), py = Math.floor(rnd() * H);
      if (!onGrass(px, py)) continue;
      const key = cfg.pool[Math.floor(rnd() * cfg.pool.length)];
      this.add.image(px, py, key).setOrigin(0.5, 1).setDepth(DEPTH.FLOOR + 1);
      placed++;
    }
  }

  // ---- PROPS ----------------------------------------------------------------
  _buildProps() {
    for (const p of WORLD.props) {
      const d = PROPS[p.key];
      const spr = this.physics.add.sprite(tileToPx(p.tx), tileToPx(p.ty), p.key).setOrigin(0.5, 0.5);
      if (p.solid && d.footprint) { Collision.makeSolid(spr, d.footprint); this.solids.add(spr); }
      else if (spr.body) { spr.body.enable = false; }
      DepthSort.track(spr, d.footprint ? d.footprint.offY : d.height / 2);

      if (p.interact) {
        Interaction.register({
          x: spr.x, y: spr.y + (d.footprint ? d.footprint.offY : 0), radius: 44,
          prompt: p.interact.prompt,
          onInteract: () => this._openDialogue(p.interact.name, p.interact.lines),
        });
      }
    }
  }

  // ---- NPCS (layered characters; solid + interactable) ----------------------
  _buildNPCs() {
    for (const n of WORLD.npcs) {
      const npc = new Character(this, tileToPx(n.tx), tileToPx(n.ty),
        { parts: n.parts, facing: n.facing, speed: n.speed });
      Collision.markSolidActor(npc);
      this.solids.add(npc);
      DepthSort.track(npc, CHAR_FOOTPRINT.offY);

      Interaction.register({
        x: npc.x, y: npc.y + CHAR_FOOTPRINT.offY, radius: 48, prompt: 'Talk',
        onInteract: () => {
          npc.facing = this._faceToward(npc, this.player);
          npc.setState('idle');
          this._openDialogue(n.name, n.lines, n.parts, n.expression);
        },
      });
    }
  }

  // ---- PLAYER ---------------------------------------------------------------
  _buildPlayer() {
    const pd = WORLD.player;
    this.player = new Character(this, tileToPx(pd.tx), tileToPx(pd.ty),
      { parts: pd.parts, facing: pd.facing, speed: pd.speed });
    Collision.markPlayer(this.player);
    this.actors.add(this.player);
    DepthSort.track(this.player, CHAR_FOOTPRINT.offY);
  }

  // ---- INPUT ----------------------------------------------------------------
  _buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D', run: 'SHIFT',
      interact: 'E', attack: 'SPACE', cast: 'C', use: 'F',
      hat: 'ONE', sword: 'TWO', shield: 'THREE', pickup: 'FOUR',
      zoomOut: 'OPEN_BRACKET', zoomIn: 'CLOSED_BRACKET',
      debug: 'B', hud: 'H',
    });
    const p = () => this.player;
    // zoom: [ out, ] in, and mouse wheel (up = in)
    this.keys.zoomOut.on('down', () => this._stepZoom(-1));
    this.keys.zoomIn.on('down', () => this._stepZoom(+1));
    this.input.on('wheel', (_ptr, _objs, _dx, dy) => this._stepZoom(dy > 0 ? -1 : +1));
    this.keys.interact.on('down', () => {
      if (this.dialogue.visible) { this._advanceDialogue(); return; }
      if (Interaction.active) Interaction.tryInteract();
    });
    this.keys.attack.on('down', () => { if (!this.dialogue.visible) p().action('attack'); });
    this.keys.cast.on('down', () => { if (!this.dialogue.visible) p().action('cast'); });
    this.keys.use.on('down', () => { if (!this.dialogue.visible) p().action('use'); });
    this.keys.pickup.on('down', () => { if (!this.dialogue.visible) p().action('pickup'); });
    this.keys.hat.on('down', () => { p().toggle('hat_feather'); this._refreshGearHud(); });
    this.keys.sword.on('down', () => { p().toggle('sword'); this._refreshGearHud(); });
    this.keys.shield.on('down', () => { p().toggle('shield'); this._refreshGearHud(); });
    this.keys.debug.on('down', () => this._toggleDebug());
    this.keys.hud.on('down', () => { this.hud.visible = !this.hud.visible; });
  }

  // Step the camera zoom by ±1 level (clamped), smoothly.
  _stepZoom(dir) {
    const next = Phaser.Math.Clamp(this.zoomIndex + dir, 0, this.zoomLevels.length - 1);
    if (next === this.zoomIndex) return;
    this.zoomIndex = next;
    this.cameras.main.zoomTo(this.zoomLevels[next], 220, 'Sine.easeInOut');
  }

  // ---- UI (scroll-fixed overlay) --------------------------------------------
  _buildUI() {
    const W = this.scale.width;
    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY);
    const title = this.add.text(6, 5, 'EMBERFALL 2 — Greenhollow (all-LPC art)',
      { fontFamily: 'monospace', fontSize: '10px', color: '#ffe9c2' }).setScrollFactor(0);
    const help = this.add.text(6, 18,
      'WASD move · Shift run · E talk · Space attack · 1/2/3 gear · 4 pickup · [ ] / wheel zoom · B colliders',
      { fontFamily: 'monospace', fontSize: '8px', color: '#bfb7d0' }).setScrollFactor(0);
    const banner = this.add.text(W - 6, 5, 'ART: LPC chars + terrain (CC-BY-SA / OGA-BY)',
      { fontFamily: 'monospace', fontSize: '8px', color: '#9fe6a0' }).setOrigin(1, 0).setScrollFactor(0);
    this.gearHud = this.add.text(6, 30, '', { fontFamily: 'monospace', fontSize: '8px', color: '#ffd9a0' }).setScrollFactor(0);
    this.hud.add([title, help, banner, this.gearHud]);
    this._refreshGearHud();

    this.prompt = this.add.text(W / 2, this.scale.height - 74, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#1c1422',
      backgroundColor: '#ffe9c2', padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);

    // Dialogue box with a PORTRAIT panel on the left (a large composed LPC face
    // of the speaker, so expression is actually visible — Gate H / faces).
    const boxW = 470, boxH = 108, bx = (W - boxW) / 2, by = this.scale.height - boxH - 8;
    const PS = 92, px = bx + 8, py = by + 8;       // portrait frame
    this.portraitBox = { x: px, y: py, size: PS };
    this._portrait = null;
    this.dialogue = this.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.OVERLAY).setVisible(false);
    const panel = this.add.rectangle(bx, by, boxW, boxH, 0x1c1422, 0.92).setOrigin(0, 0).setStrokeStyle(2, 0xffe9c2);
    this.portraitFrame = this.add.rectangle(px, py, PS, PS, 0x6d7488, 1).setOrigin(0, 0).setStrokeStyle(2, 0xffe9c2);
    const tx = px + PS + 12;
    this.dlgName = this.add.text(tx, by + 10, '', { fontFamily: 'monospace', fontSize: '12px', color: '#ffe9c2' });
    this.dlgBody = this.add.text(tx, by + 30, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#f3ecff',
      wordWrap: { width: boxW - (PS + 12 + 8) - 12 }, lineSpacing: 3,
    });
    this.dlgHint = this.add.text(bx + boxW - 10, by + boxH - 6, 'E ▸', { fontFamily: 'monospace', fontSize: '8px', color: '#9b93b0' }).setOrigin(1, 1);
    this.dialogue.add([panel, this.portraitFrame, this.dlgName, this.dlgBody, this.dlgHint]);
  }

  // Compose a large face portrait of the speaker from its LPC face layers
  // (down-idle frame, head region) into a RenderTexture shown in the box.
  _buildPortrait(parts, expression = 'neutral') {
    if (this._portrait) { this._portrait.destroy(); this._portrait = null; }
    this.portraitFrame.setVisible(!!parts);
    if (!parts) return;
    const FACE_SLOTS = new Set(['body', 'ears', 'nose', 'eyes', 'brows', 'hair', 'hat', 'torso']);
    const layers = [];
    for (const pk of parts) {
      const part = PARTS[pk];
      if (!part || !FACE_SLOTS.has(part.slot)) continue;
      for (const L of part.layers) layers.push({ ...L, slot: part.slot });
    }
    layers.sort((a, b) => a.z - b.z);
    // head crop within the 64px down-idle frame (row 10, col 0 => frame 130).
    // The LPC face sits high: hair ~y14-26, brows ~y27, eyes ~y29-32, so this
    // box tightly frames hair+brows+eyes+chin (measured from the sheet).
    const FRAME_DOWN_IDLE = (8 + DIR_ROW.down) * 13;
    const cx = 16, cy = 13, cw = 32, ch = 38;      // bust: hair-top to shoulders
    // Expression is conveyed by nudging the brow layer (the only expression art
    // that aligns with this body): angry = furrowed (down), happy/sad = raised.
    const browDy = { neutral: 0, happy: -1, sad: -1, angry: 2 }[expression] || 0;
    const rt = this.make.renderTexture({ x: 0, y: 0, width: cw, height: ch }, false);
    for (const L of layers) {
      const dy = L.slot === 'brows' ? browDy : 0;
      rt.drawFrame(L.tex, FRAME_DOWN_IDLE, -cx, -cy + dy);
    }
    const { x, y, size } = this.portraitBox;
    const scale = Math.min((size - 6) / cw, (size - 6) / ch); // fit within the frame
    rt.setOrigin(0.5, 0.5).setPosition(x + size / 2, y + size / 2).setScale(scale).setScrollFactor(0);
    this.dialogue.add(rt);
    this._portrait = rt;
  }

  _refreshGearHud() {
    const g = this.player;
    const on = (slot, label) => (g.equippedIn(slot) ? `[${label}]` : ` ${label} `);
    this.gearHud.setText(`Equipped:  ${on('hat', 'hat')}  ${on('weapon', 'sword')}  ${on('shield', 'shield')}`);
  }

  _buildDebug() {
    this.debugOn = false;
    this.physics.world.createDebugGraphic();
    this.physics.world.debugGraphic.setDepth(DEPTH.OVERLAY + 1).setVisible(false);
    this.physics.world.drawDebug = false;
  }

  _toggleDebug() {
    this.debugOn = !this.debugOn;
    this.physics.world.drawDebug = this.debugOn;
    this.physics.world.debugGraphic.setVisible(this.debugOn);
    if (!this.debugOn) this.physics.world.debugGraphic.clear();
  }

  // ---- DIALOGUE -------------------------------------------------------------
  _openDialogue(name, lines, parts = null, expression = 'neutral') {
    this._dlgLines = lines; this._dlgIndex = 0;
    this.dlgName.setText(name);
    this.dlgBody.setText(lines[0]);
    this._buildPortrait(parts, expression);
    this.dialogue.setVisible(true);
    this.prompt.setVisible(false);
    Movement.stop(this.player);
  }

  _advanceDialogue() {
    this._dlgIndex++;
    if (this._dlgIndex >= this._dlgLines.length) { this.dialogue.setVisible(false); return; }
    this.dlgBody.setText(this._dlgLines[this._dlgIndex]);
  }

  _faceToward(from, to) {
    const dx = to.x - from.x, dy = to.y - from.y;
    if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
    return dy < 0 ? 'up' : 'down';
  }

  // ---- LOOP -----------------------------------------------------------------
  update() {
    if (this.dialogue.visible) { Movement.stop(this.player); DepthSort.update(); return; }

    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.left.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.keys.right.isDown) dx += 1;
    if (this.cursors.up.isDown || this.keys.up.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.keys.down.isDown) dy += 1;
    Movement.drive(this.player, dx, dy, this.keys.run.isDown);

    DepthSort.update();

    const active = Interaction.update(this.player);
    if (active) this.prompt.setText(`${active.prompt}  (E)`).setVisible(true);
    else this.prompt.setVisible(false);
  }
}
